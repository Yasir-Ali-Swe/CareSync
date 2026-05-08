# PHASE 4: ADMIN - GAP REPORT

**Date:** May 9, 2026  
**Phase:** PHASE 4 - Admin Workflows  
**Status:** PRE-IMPLEMENTATION AUDIT

---

## OVERVIEW

PHASE 4 focuses on the admin workflows that are currently present in the UI but not fully wired to backend mutations:
- Wire suspend/activate user actions in the admin user management page
- Fix admin profile save/fetch flow so it uses an admin-specific backend path instead of patient/doctor profile APIs

---

## FIX #1: USER MANAGEMENT ACTIONS ARE UI-ONLY

### Issue Location
**File:** [client/src/pages/dashboard/Admin/UserManagment.jsx](client/src/pages/dashboard/Admin/UserManagment.jsx#L70-L120)

### Current Code (NON-FUNCTIONAL)
```jsx
<DropdownMenuItem disabled={row.status !== "active"}>
  <UserRoundX className="size-4" />
  Suspend User
</DropdownMenuItem>
<DropdownMenuItem>
  {row.status === "active" ? (
    <>
      <UserRoundX className="size-4" />
      Deactivate User
    </>
  ) : (
    <>
      <UserRoundCheck className="size-4" />
      Activate User
    </>
  )}
</DropdownMenuItem>
```

### Root Cause
- Buttons have no `onClick` handlers
- No mutation is wired to the backend
- `adminApi` exposes only `getStats()` and `getUsers()`, so there is no client method for status updates
- The backend already exposes `PATCH /admin/users/:userId/status`, but the UI never calls it

### Backend Route (READY)
**File:** [server/src/routes/admin.routes.js](server/src/routes/admin.routes.js#L9-L14)
```javascript
router.patch("/users/:userId/status", updateUserStatus);
```

### Backend Validation (READY)
**File:** [server/src/controllers/admin.controller.js](server/src/controllers/admin.controller.js#L27-L44)
```javascript
if (!Object.values(USER_STATUS).includes(status)) {
  return res.status(400).json({ success: false, message: "Invalid status" });
}
```

### Root Cause Details
- The admin page renders action affordances, but they are disconnected from the API layer
- The action labels are semantically inconsistent with the available `USER_STATUS` values (`active`, `inactive`, `suspended`)
- The page is filtered to doctors only by default, but the platform should allow status control across user roles

### Impact
- Admin users cannot suspend/activate users from the UI
- The platform appears functional but the action buttons do nothing
- Operational admin control is blocked in production

### Fix Implementation
- Add `updateUserStatus()` to `admin.api.js`
- Wire mutations into the dropdown actions
- Invalidate the user list query after success
- Keep the action labels aligned with backend statuses

---

## FIX #2: ADMIN PROFILE SAVE FLOW USES THE WRONG BACKEND PATH

### Issue Location
**File:** [client/src/components/dashboard/profile/ProfileFlowPage.jsx](client/src/components/dashboard/profile/ProfileFlowPage.jsx#L1-L100)

### Current Code (WRONG ROUTE SELECTION)
```jsx
const submitApi = user?.role === "doctor" ? doctorApi : patientApi;
...
const response =
  user?.role === "doctor"
    ? await submitApi.updateDoctorProfile(payload)
    : await submitApi.updatePatientProfile(payload);
```

### Root Cause
- Admin role is not handled explicitly
- For admins, the code falls through to `patientApi`
- The admin profile page is routed through `ProfileFlowPage`, so the wrong backend path is used for every admin save
- There is no admin-specific profile fetch/save endpoint yet

### Current Admin Page Wiring
**File:** [client/src/pages/dashboard/Admin/Profile.jsx](client/src/pages/dashboard/Admin/Profile.jsx#L1-L6)
```javascript
const Profile = () => <ProfileFlowPage {...adminProfileConfig} />;
```

### Current Admin Profile Config
**File:** [client/src/components/dashboard/profile/profileFlowConfigs.jsx](client/src/components/dashboard/profile/profileFlowConfigs.jsx#L1881-L1913)
- Admin profile uses the shared personal/contact step UI
- That UI requires a save flow that is not patient/doctor-specific

### Backend Gap
There is no current admin profile endpoint in the backend. Only:
- `GET /api/auth/me` for basic current-user data
- patient/doctor profile endpoints for role-specific profiles
- admin user status/statistics endpoints

### Impact
- Admin profile edits cannot be persisted correctly
- Save attempts are misrouted to patient endpoints
- Profile data can be silently rejected or stored in the wrong collection

### Fix Implementation
- Add admin profile read/update endpoints to the admin backend
- Add `getProfile()` and `updateProfile()` methods to `admin.api.js`
- Update `ProfileFlowPage` to use `adminApi` when `user.role === "admin"`
- Return updated profile + user data from the admin update endpoint

---

## DATA FLOW GAPS

### User Status Flow Today
```
Admin clicks action
  ↓
UI renders dropdown item only
  ↓
No mutation is called
  ↓
No backend update occurs
```

### Admin Profile Save Flow Today
```
Admin edits form
  ↓
ProfileFlowPage sees role !== doctor
  ↓
Falls through to patientApi.updatePatientProfile()
  ↓
Backend patient route is used incorrectly
  ↓
Admin profile is not persisted as an admin workflow
```

---

## REQUIRED BACKEND/FRONTEND CHANGES

### Backend
1. Add admin profile fetch endpoint
2. Add admin profile update endpoint
3. Optionally store admin profile details in the user document so auth bootstrap can hydrate them

### Frontend
1. Add `adminApi.updateUserStatus()`
2. Add `adminApi.getProfile()` and `adminApi.updateProfile()`
3. Wire mutations into `UserManagment.jsx`
4. Make `ProfileFlowPage.jsx` explicitly branch for admin

---

## REGRESSION RISKS

### User Status Updates
- Medium: status changes affect dashboard visibility and access control
- Mitigation: invalidate the user list query and keep the action mapping explicit

### Admin Profile Save
- Medium: introducing a new admin profile endpoint changes the current save flow
- Mitigation: preserve current form shape and return the updated user/profile snapshot after save

---

## VALIDATION CHECKLIST

- [ ] Suspend action updates a user status in the backend
- [ ] Activate action updates a user status in the backend
- [ ] Admin user list refreshes after status mutation
- [ ] Admin profile page saves through an admin-specific endpoint
- [ ] Admin profile fetch returns persisted values
- [ ] Build passes after changes

---

## READY FOR IMPLEMENTATION

✅ Root causes identified  
✅ Backend gaps confirmed  
✅ Current frontend save flow traced  
✅ No assumptions left unresolved  
