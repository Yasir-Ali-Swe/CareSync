# Admin Onboarding Completion Audit

**Date**: 2026-05-09  
**Scope**: Read-only audit of the admin onboarding submit flow, redirect flow, and completion persistence.

---

## Files inspected

Frontend:
- [client/src/pages/onboarding/AdminOnboarding.jsx](client/src/pages/onboarding/AdminOnboarding.jsx)
- [client/src/services/admin.api.js](client/src/services/admin.api.js)
- [client/src/services/auth.api.js](client/src/services/auth.api.js)
- [client/src/store/slices/authSlice.js](client/src/store/slices/authSlice.js)
- [client/src/components/OnboardingRedirect.jsx](client/src/components/OnboardingRedirect.jsx)
- [client/src/components/OnboardingGuard.jsx](client/src/components/OnboardingGuard.jsx)
- [client/src/components/PublicRoute.jsx](client/src/components/PublicRoute.jsx)
- [client/src/components/AuthInitializer.jsx](client/src/components/AuthInitializer.jsx)
- [client/src/components/dashboard/profile/ProfileFlowPage.jsx](client/src/components/dashboard/profile/ProfileFlowPage.jsx)
- [client/src/App.jsx](client/src/App.jsx)

Backend:
- [server/src/controllers/admin.controller.js](server/src/controllers/admin.controller.js)
- [server/src/controllers/auth.controller.js](server/src/controllers/auth.controller.js)
- [server/src/routes/admin.routes.js](server/src/routes/admin.routes.js)
- [server/src/routes/auth.routes.js](server/src/routes/auth.routes.js)
- [server/src/models/user.model.js](server/src/models/user.model.js)

---

## 1) Submit payload audit

### Current payload sent from AdminOnboarding
In [client/src/pages/onboarding/AdminOnboarding.jsx](client/src/pages/onboarding/AdminOnboarding.jsx), the submit handler is:

- `handleNext()` selects one object based on the current step:
  - Step 1: `formData.personalInfo`
  - Step 2: `formData.contactInfo`
- Then it calls:
  - `updateProfileMutation.mutate(data)`

That means the payload shape is currently **flat per step**, not a single combined object.

#### Step 1 payload shape
```js
{
  fullName: "...",
  email: "...",
  birthDate: "...",
  gender: "..."
}
```

#### Step 2 payload shape
```js
{
  primaryPhone: "...",
  secondaryPhone: "...",
  address: "...",
  province: "...",
  city: "..."
}
```

### What the backend expects
[server/src/controllers/admin.controller.js](server/src/controllers/admin.controller.js) `updateAdminProfile()` accepts either:
- `body.personalInfo` / `body.contactInfo` as nested objects, or
- flat fields in the request body

It detects direct fields with:
- `hasDirectPersonalInfo`
- `hasDirectContactInfo`

So the current flat payload is acceptable for save logic.

### Audit conclusion
- The frontend does **not** send a combined payload like `{ personalInfo: {...}, contactInfo: {...} }`.
- It sends **step-specific flat payloads**.
- That is not inherently broken because the backend supports flat payloads.

---

## 2) Backend controller audit

### Route and controller
The admin onboarding save uses:
- `PATCH /api/admin/profile`
- mounted in [server/src/routes/admin.routes.js](server/src/routes/admin.routes.js)
- controller: `updateAdminProfile` in [server/src/controllers/admin.controller.js](server/src/controllers/admin.controller.js)

### Update logic
The controller:
- reads `req.body`
- maps flat personal/contact fields into `adminProfile.personalInfo` and `adminProfile.contactInfo`
- assigns `user.adminProfile = adminProfile`
- saves with `await user.save()`

Relevant flow:
- personal info fields are merged into `adminProfile.personalInfo`
- contact fields are merged into `adminProfile.contactInfo`

### Persistence gap found
`updateAdminProfile()` does **not** set:
- `user.adminProfile.onboardingCompleted = true`

Instead, it currently returns the user with:
- `isOnboardingCompleted: Boolean(user.adminProfile?.onboardingCompleted)`

Since onboardingCompleted is not set here, it remains false unless another controller updates it.

### Audit conclusion
- The controller is wired to the correct route and does save profile fields.
- The **completion flag is never set to true** in the save path.
- That is the main backend reason completion does not persist.

---

## 3) Redirect logic audit

### Current redirect path after completion
In [client/src/pages/onboarding/AdminOnboarding.jsx](client/src/pages/onboarding/AdminOnboarding.jsx), the success handler does:
- step 1 success: `setCurrentStep(2)`
- step 2 success: `navigate("/dashboard/admin/stats")`

### Route table reality
In [client/src/App.jsx](client/src/App.jsx), the admin dashboard lives under:
- `/dashboard/admin/stats`
- `/dashboard/admin/users-management`
- `/dashboard/admin/profile`

There is **no** `/admin/dashboard` route defined.

### Why the user returns to onboarding step 1
The route guards still depend on auth state:
- [client/src/components/OnboardingGuard.jsx](client/src/components/OnboardingGuard.jsx)
- It checks `user?.isOnboardingCompleted`
- If false, it redirects to `/onboarding`

[client/src/components/OnboardingRedirect.jsx](client/src/components/OnboardingRedirect.jsx) also routes admin users to:
- `/admin-onboarding/1`

[client/src/components/AuthInitializer.jsx](client/src/components/AuthInitializer.jsx) loads `/auth/me` and dispatches `setAuthUser(...)` from that response.

[server/src/controllers/auth.controller.js](server/src/controllers/auth.controller.js) `me()` reads admin completion from:
- `user.adminProfile?.onboardingCompleted`

Because `updateAdminProfile()` does not set that flag to true, `auth/me` continues to return `isOnboardingCompleted: false`.

### Audit conclusion
- Redirect back to onboarding is caused by `isOnboardingCompleted` staying false.
- The currently navigated dashboard path is `/dashboard/admin/stats`, not `/admin/dashboard`.
- The requested path `/admin/dashboard` does not currently exist in the route table.

---

## 4) Await chain audit

### Current frontend behavior
In [client/src/pages/onboarding/AdminOnboarding.jsx](client/src/pages/onboarding/AdminOnboarding.jsx):
- `handleNext()` calls `updateProfileMutation.mutate(data)`
- completion navigation is done in `onSuccess`

### What is missing
The component does **not**:
- `await` a mutation promise via `mutateAsync`
- invalidate the auth query
- refresh current user state after save
- dispatch an updated auth user to Redux

### Contrast with an existing correct pattern
[client/src/components/dashboard/profile/ProfileFlowPage.jsx](client/src/components/dashboard/profile/ProfileFlowPage.jsx) does the following after save:
- updates profile
- if response contains `user`, dispatches `setAuthUser(response.data.user)`
- otherwise refetches `authApi.getMe()` and dispatches the result

That pattern is absent in AdminOnboarding.

### Audit conclusion
- There is no explicit awaited auth refresh after save.
- The component relies on mutation success only, without refreshing the cached auth state.
- This leaves Redux and query cache stale, which preserves the old onboarding state.

---

## 5) Additional state and persistence findings

### Auth state shape
[client/src/store/slices/authSlice.js](client/src/store/slices/authSlice.js) stores:
- `user`
- `role`
- `isAuthenticated`
- `loading`

`isOnboardingCompleted` comes from the API payload; it is not a separately managed slice field.

### `/auth/me` behavior
[server/src/controllers/auth.controller.js](server/src/controllers/auth.controller.js) `me()` returns:
- `isOnboardingCompleted = Boolean(user.adminProfile?.onboardingCompleted)` for admin

So if `adminProfile.onboardingCompleted` remains false, the auth bootstrap will keep the user in onboarding flow.

### Admin profile save response
[server/src/controllers/admin.controller.js](server/src/controllers/admin.controller.js) `updateAdminProfile()` currently returns:
- `isOnboardingCompleted: Boolean(user.adminProfile?.onboardingCompleted)`

That means the response still reports false after save unless the save code sets the flag.

---

## Root cause summary

1. **Completion flag is never persisted** in `updateAdminProfile()`.
2. **Auth state is not refreshed** after onboarding save, so Redux keeps stale onboarding info.
3. **Redirect target mismatch** exists in the route table: current app route is `/dashboard/admin/stats`, not `/admin/dashboard`.
4. The submit payload is step-flat, but backend does support it; payload shape itself is **not** the primary bug.

---

## Files most relevant to fix

- [server/src/controllers/admin.controller.js](server/src/controllers/admin.controller.js)
  - persist `adminProfile.onboardingCompleted = true` on successful final save
  - keep profile field mapping intact

- [client/src/pages/onboarding/AdminOnboarding.jsx](client/src/pages/onboarding/AdminOnboarding.jsx)
  - refresh auth state after successful step 2 save
  - redirect to the correct admin dashboard route after completion

- [client/src/components/OnboardingGuard.jsx](client/src/components/OnboardingGuard.jsx)
  - already depends on `user.isOnboardingCompleted`; it will work once auth state is refreshed

- [server/src/controllers/auth.controller.js](server/src/controllers/auth.controller.js)
  - `me()` already reads the correct admin onboarding flag

---

## Audit verdict

The onboarding UI can submit, but completion is not finalized because the save path never sets `adminProfile.onboardingCompleted = true`, and the frontend does not refresh auth state after save. That combination causes the user to be redirected back into onboarding on subsequent navigation or reload.
