# PHASE 2: AUTH STABILITY - GAP REPORT

**Date:** May 9, 2026  
**Phase:** PHASE 2 - Auth Stability & Token Refresh  
**Status:** PRE-IMPLEMENTATION AUDIT

---

## OVERVIEW

PHASE 2 focuses on implementing a resilient authentication system that:
- Automatically refreshes access tokens when expired
- Prevents logout on temporary network failures
- Retries failed requests after token refresh
- Improves auth bootstrap error handling

---

## FIX #1: INCOMPLETE AXIOS INTERCEPTOR - TOKEN REFRESH MISSING

### Issue Location
**File:** [client/src/lib/axios.js](client/src/lib/axios.js#L19-L27)

### Current Code (INCOMPLETE)
```javascript
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      originalRequest._retry = true;
      // ❌ MISSING: Refresh token logic here
    }

    return Promise.reject(error);
  },
);
```

### Root Cause
The interceptor has a stub for handling 401 errors but never:
1. Calls the refresh token endpoint
2. Stores the new access token
3. Retries the original request
4. Handles refresh failure

### Data Flow Problem
```
Request → 401 Unauthorized
    ↓
Check if already retried (no)
    ↓
Set _retry = true
    ↓
❌ Just rejects error (MISSING: refresh token)
    ↓
App logout
```

### Backend Endpoint (READY)
**File:** [server/src/controllers/auth.controller.js](server/src/controllers/auth.controller.js#L213-L266)
```javascript
export const refreshToken = asyncHandler(async (req, res) => {
  const incomingToken = req.cookies?.[env.REFRESH_COOKIE_NAME];

  if (!incomingToken) {
    return res.status(401).json({ success: false, message: "Refresh token missing" });
  }

  let decoded;
  try {
    decoded = tokenService.verifyRefreshToken(incomingToken);
  } catch (error) {
    return res.status(401).json({ success: false, message: "Invalid refresh token" });
  }

  const user = await User.findById(decoded.sub).select("+refreshTokenHash role status");
  if (!user || !user.refreshTokenHash) {
    return res.status(401).json({ success: false, message: "Session invalid" });
  }

  const incomingHash = tokenService.hashToken(incomingToken);
  if (incomingHash !== user.refreshTokenHash) {
    return res.status(401).json({ success: false, message: "Refresh token mismatch" });
  }

  if (user.status !== USER_STATUS.ACTIVE) {
    return res.status(403).json({ success: false, message: "Account is not active" });
  }

  const payload = { sub: String(user._id), role: user.role };
  const { accessToken, refreshToken: newRefreshToken } =
    tokenService.generateAuthTokens(payload);

  user.refreshTokenHash = tokenService.hashToken(newRefreshToken);
  await user.save();

  setRefreshCookie(res, newRefreshToken);

  return res.status(200).json({
    success: true,
    message: "Token refreshed",
    data: { accessToken },  // ✅ New access token
  });
});
```

**Route:** [server/src/routes/auth.routes.js](server/src/routes/auth.routes.js#L19)
```javascript
router.post("/refresh-token", refreshToken);
```

### Implementation Gap
1. authApi.js doesn't have refreshToken method
2. Axios interceptor doesn't call authApi.refreshToken
3. New token isn't stored in localStorage
4. Original request isn't retried

---

## FIX #2: MISSING REFRESH TOKEN API CLIENT METHOD

### Issue Location
**File:** [client/src/services/auth.api.js](client/src/services/auth.api.js)

### Current Code (INCOMPLETE)
```javascript
export const authApi = {
  login: async (payload) => { ... },
  register: async (payload) => { ... },
  logout: async () => { ... },
  verifyEmail: async (token) => { ... },
  forgotPassword: async (payload) => { ... },
  resetPassword: async (token, payload) => { ... },
  getMe: async () => { ... },
  getOnboardingStatus: async (role) => { ... },
  // ❌ MISSING: refreshToken method
};
```

### Root Cause
The refresh token endpoint exists on backend but has no corresponding client method, so the axios interceptor has nowhere to call.

### Fix Implementation
Need to add:
```javascript
refreshToken: async () => {
  const response = await api.post("/auth/refresh-token");
  return response.data;
},
```

---

## FIX #3: NETWORK FAILURES CLEAR AUTH IMMEDIATELY

### Issue Location
**File:** [client/src/components/AuthInitializer.jsx](client/src/components/AuthInitializer.jsx#L33-L42)

### Current Code (OVERLY AGGRESSIVE)
```javascript
useEffect(() => {
  if (isError) {
    localStorage.removeItem("accessToken");
    dispatch(clearAuth());    // ❌ Clears on ANY error, including network failures
  }
}, [dispatch, isError]);
```

### Root Cause
The component clears authentication on ANY error, including:
- Network timeouts
- Server temporarily down
- DNS resolution failures
- Gateway timeouts

These are transient errors that shouldn't log the user out.

### How This Manifests
1. User browsing normally
2. Network flickers or server slow
3. `/auth/me` request fails (network error, not 401)
4. isError becomes true
5. AuthInitializer clears token
6. User gets logged out despite valid session
7. User frustrated by unexpected logout

### Implementation Gap
No distinction between:
- 401 Unauthorized (invalid token - should logout)
- 5xx Server Error (transient - should retry)
- Network Error (transient - should retry)
- 403 Forbidden (invalid onboarding - should handle differently)

---

## FIX #4: AUTH BOOTSTRAP IMPROVED ERROR HANDLING

### Issue Location
**File:** [client/src/components/AuthInitializer.jsx](client/src/components/AuthInitializer.jsx#L6-L50)

### Current Code (BASIC ERROR HANDLING)
```javascript
const AuthInitializer = () => {
  const dispatch = useDispatch();

  const { data, isSuccess, isError, isFetched } = useQuery({
    queryKey: ["auth", "me"],
    queryFn: authApi.getMe,
    retry: false,                    // ❌ No retry strategy
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    dispatch(setAuthLoading(true));
  }, [dispatch]);

  useEffect(() => {
    const syncUser = async () => {
      if (!isSuccess) return;

      try {
        const apiUser = data?.data?.user;
        if (!apiUser) {
          dispatch(clearAuth());
          return;
        }
        dispatch(
          setAuthUser({
            ...apiUser,
            id: apiUser.id || apiUser._id,
            isOnboardingCompleted: Boolean(apiUser.isOnboardingCompleted),
          }),
        );
      } catch (error) {
        localStorage.removeItem("accessToken");
        dispatch(clearAuth());
      }
    };

    syncUser();
  }, [data, dispatch, isSuccess]);

  useEffect(() => {
    if (isError) {
      localStorage.removeItem("accessToken");
      dispatch(clearAuth());       // ❌ Clears on transient errors
    }
  }, [dispatch, isError]);

  useEffect(() => {
    if (isFetched) {
      dispatch(setAuthLoading(false));
    }
  }, [dispatch, isFetched]);

  return null;
};
```

### Root Cause
1. `retry: false` means no automatic retries
2. All errors treated equally (no distinction)
3. Network errors immediately clear session
4. No exponential backoff strategy
5. No maximum retry limit

### Data Flow Problem
```
App loads
    ↓
AuthInitializer fetches /auth/me
    ↓
Network error or timeout
    ↓
query fails (retry: false, no retry)
    ↓
isError = true
    ↓
immediately clearAuth()
    ↓
User logged out
```

### Should Instead Be
```
App loads
    ↓
AuthInitializer fetches /auth/me
    ↓
Network error or timeout
    ↓
Query retries with backoff (max 3x)
    ↓
If 401: clearAuth (invalid token)
If 5xx: retry (server error)
If network: retry (transient)
    ↓
If all retries fail: show "loading..." or keep session if valid
```

---

## FIX #5: LOGIN COMPONENT DOESN'T TRIGGER /AUTH/ME REFRESH

### Issue Location
**File:** [client/src/components/auth/Login.jsx](client/src/components/auth/Login.jsx#L31-L55)

### Current Code
```javascript
const loginMutation = useMutation({
  mutationFn: authApi.login,
  onSuccess: async (response) => {
    const accessToken = response?.data?.accessToken;
    const apiUser = response?.data?.user;

    if (accessToken) {
      localStorage.setItem("accessToken", accessToken);
    }

    const isOnboardingCompleted = await authApi.getOnboardingStatus(apiUser.role);

    const user = {
      ...apiUser,
      id: apiUser?.id || apiUser?._id,
      isOnboardingCompleted,
    };

    dispatch(setAuthUser(user));
    toast.success("Login successful");

    if (!isOnboardingCompleted && user.role !== "admin") {
      navigate("/onboarding", { replace: true });
      return;
    }

    navigate(getDashboardRouteByRole(user.role), { replace: true });
  },
  onError: (error) => {
    const message = error?.response?.data?.message || "Unable to login";
    toast.error(message);
  },
});
```

### Root Cause
After login success, component doesn't invalidate the `["auth", "me"]` query cache, so:
1. AuthInitializer might not refresh user immediately
2. Redux state has partial data from login response
3. `/auth/me` endpoint not called to get full user profile
4. New access token not validated by backend

### Should Trigger Query Invalidation
```javascript
// After successful login
queryClient.invalidateQueries({ queryKey: ["auth", "me"] });
```

---

## ARCHITECTURE ANALYSIS

### Backend Token Flow (CORRECT)
```
LOGIN ENDPOINT
    ↓
Generate accessToken (exp: 15m)
Generate refreshToken (exp: 30d)
Set httpOnly cookie: refreshToken
Return: accessToken in response body
    ↓
CLIENT RECEIVES
    ↓
Success: Store accessToken in localStorage ✓
Cookie: Automatically stored by browser ✓

REQUEST WITH accessToken
    ↓
Server checks Authorization header: Bearer <token>
Validates JWT signature
Validates expiry
Response 200 if valid, 401 if expired

ON 401 RESPONSE
    ↓
Client calls POST /refresh-token
    ↓
Server checks refreshToken from cookie
Validates refresh token signature
Validates refresh token hash in DB
Generates new accessToken pair
Sets new httpOnly cookie: refreshToken
Return: New accessToken in response
    ↓
CLIENT STORES
    ↓
Update localStorage: new accessToken
Cookie: Automatically updated by browser
Retry original request with new accessToken
```

### Client-Side Gap
The refresh flow is PARTIALLY implemented:
- ✅ Backend refresh endpoint works
- ✅ httpOnly cookie storage works (automatic via browser)
- ❌ Client has no method to call refresh endpoint
- ❌ Axios interceptor doesn't call refresh
- ❌ No retry mechanism for original request
- ❌ No distinction between error types

---

## TOKEN LIFECYCLE TIMING

### Access Token
- Type: JWT in localStorage (vulnerable but convenient)
- Expiry: 15 minutes
- Used: Every API request in Authorization header
- Refresh: Automatic at 401 or before expiry

### Refresh Token
- Type: JWT in httpOnly cookie (secure)
- Expiry: 30 days
- Used: Only by `/refresh-token` endpoint
- Hash: Stored in User.refreshTokenHash for validation

### Session Continuation Requirement
For user to stay logged in:
1. Within 30 days of last login
2. AccessToken can be refreshed if expired
3. If refreshToken also expired (30 days), user must re-login

---

## IMPLEMENTATION REQUIREMENTS

### Requirement 1: Refresh Token Client Method
**File:** authApi.js
- Add `refreshToken()` method
- POST to `/auth/refresh-token`
- Return new accessToken
- Don't require parameters (cookie sent automatically)

### Requirement 2: Axios Interceptor Enhancement
**File:** axios.js
- On 401 response:
  1. Call `authApi.refreshToken()`
  2. If success: Update localStorage with new accessToken
  3. Retry original request with new token
  4. If refresh fails: Clear auth and reject
- On other errors:
  1. Network errors: Don't clear auth
  2. 5xx errors: Don't clear auth
  3. 403/404: Pass through (no refresh)

### Requirement 3: AuthInitializer Improvements
**File:** AuthInitializer.jsx
- Enable TanStack Query retry with exponential backoff
- Distinguish error types:
  - 401: Unauthorized (clear auth)
  - 5xx: Server error (retry)
  - Network: Transient (retry)
  - 403: Forbidden (don't retry, don't clear)
- Keep loading state if retrying

### Requirement 4: Auth Bootstrap Resilience
**File:** AuthInitializer.jsx
- Use aggressive retry strategy
- Max retries: 3 with exponential backoff (100ms, 200ms, 400ms)
- Only clear auth on 401
- Keep session active if network fails
- Show user "reconnecting..." if retrying

### Requirement 5: Query Cache Invalidation
**File:** Login.jsx
- After successful login
- Invalidate `["auth", "me"]` query
- Force fresh fetch of full user profile
- Ensure Redux state matches backend

---

## SECURITY CONSIDERATIONS

### httpOnly Cookie Advantages
✅ Can't be accessed by JavaScript (XSS proof)
✅ Automatically sent on same-origin requests
✅ Already implemented on backend

### localStorage Token Trade-offs
⚠️ Can be accessed by JavaScript (XSS risk)
⚠️ Used for authorization header (not httpOnly cookie)
⚠️ More convenient for SPA architecture
✅ Can be cleared on logout
✅ Can implement refresh token rotation

### Recommended Approach for This Codebase
Keep both:
- ✅ httpOnly cookie for refresh token (automatic, secure)
- ✅ localStorage for access token (explicit, convenient)
- ✅ Auto-refresh on 401 (transparent to user)
- ✅ Retry logic (resilient)

### Attack Vectors Mitigated
1. **Access token expiry attack**: Auto-refresh at 401
2. **Network failure logout**: Only logout on 401, not network errors
3. **CSRF attacks**: httpOnly cookie prevents JS access
4. **Refresh token abuse**: Hash verification in DB, rotation on each refresh

---

## ERROR SCENARIOS

### Scenario 1: Access Token Expires During User Activity
```
User scrolling dashboard
    ↓
Click "Book Appointment"
    ↓
Request with expired accessToken
    ↓
Server returns 401
    ↓
Axios interceptor calls /refresh-token
    ↓
Server validates refreshToken cookie, generates new accessToken
    ↓
Axios updates localStorage with new accessToken
    ↓
Axios retries original "Book Appointment" request
    ↓
Request succeeds with new token
    ↓
User sees success notification (transparent)
```

### Scenario 2: Network Failure During Active Session
```
User browsing normally
    ↓
Network briefly disconnects
    ↓
Background refresh attempt fails (network error)
    ↓
Query retries with backoff (not immediate logout)
    ↓
Network recovers
    ↓
Retry succeeds
    ↓
User continues using app (session preserved)
```

### Scenario 3: Refresh Token Expired (30 days)
```
User opens app after 31 days
    ↓
AuthInitializer calls /auth/me
    ↓
AccessToken expired (if stored after 15 min)
    ↓
401 response
    ↓
Axios interceptor calls /refresh-token
    ↓
Server rejects (refreshToken cookie expired)
    ↓
Axios interceptor clears auth
    ↓
User redirected to login
    ↓
User must re-login
```

### Scenario 4: Multiple Tabs/Windows
```
Tab A: User logs in
    ↓
Tab A saves accessToken to localStorage
    ↓
Tab B: User has app open
    ↓
Tab B uses old accessToken
    ↓
Tab B gets 401
    ↓
Tab B calls /refresh-token (cookie shared)
    ↓
Server generates new tokens
    ↓
Tab B updates localStorage with new accessToken
    ↓
Tab B retries request (succeeds)
    ↓
Tab A might still have old token, will 401 on next request
    ↓
Tab A will also refresh (same flow)
```

---

## FILES TO MODIFY

| File | Changes | Impact |
|------|---------|--------|
| [client/src/services/auth.api.js](client/src/services/auth.api.js) | Add refreshToken() method | 2 lines |
| [client/src/lib/axios.js](client/src/lib/axios.js) | Implement full refresh logic | 30-40 lines |
| [client/src/components/AuthInitializer.jsx](client/src/components/AuthInitializer.jsx) | Enable retry, improve errors | 20-30 lines |
| [client/src/components/auth/Login.jsx](client/src/components/auth/Login.jsx) | Invalidate query cache | 5 lines |

---

## VALIDATION CHECKLIST

### Unit Tests Needed
- [ ] accessToken refresh on 401
- [ ] Original request retry after refresh
- [ ] Network error doesn't logout
- [ ] Refresh failure clears auth
- [ ] Multiple tab sync (localStorage change detection)

### Integration Tests Needed
- [ ] Login → appointment booking (token lifecycle)
- [ ] Background token refresh
- [ ] Network failure recovery
- [ ] Session persistence across page reload
- [ ] 30-day refresh token boundary

### Manual Testing Needed
- [ ] Login with dev tools network throttle
- [ ] Simulate 401 response
- [ ] Simulate network timeout
- [ ] Open app after 15+ minutes (token expired)
- [ ] Multiple tabs active simultaneously

---

## DEPENDENCIES

- ✅ TanStack Query (v5+) - Already installed
- ✅ Axios - Already installed
- ✅ Redux Toolkit - Already installed
- ✅ React Router - Already installed
- ⚠️ No new dependencies needed

---

## RISK ASSESSMENT

| Risk | Level | Mitigation |
|------|-------|-----------|
| Infinite refresh loop | Medium | Implement max retry limit |
| Race conditions (multi-tab) | Medium | Use localStorage for state sync |
| Cookie handling issues | Low | Browser handles httpOnly |
| Performance impact | Low | Refresh only on 401 |

---

## READY FOR IMPLEMENTATION

✅ All root causes identified  
✅ Backend refresh endpoint verified  
✅ No breaking changes required  
✅ Backward compatible with existing auth flow  
✅ Resilience improvements only  
