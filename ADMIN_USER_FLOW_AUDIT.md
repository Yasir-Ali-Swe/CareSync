# Admin User Flow Read-Only Audit

**Date**: 2026-05-09
**Scope (read-only)**: Frontend onboarding components, admin user-management UI, admin API surface, backend create-user flow, and email service.

---

## Files Inspected

Frontend:
- client/src/pages/onboarding/AdminOnboarding.jsx
- client/src/components/OnboardingGuard.jsx
- client/src/components/PublicRoute.jsx
- client/src/pages/dashboard/Admin/UserManagement.jsx
- client/src/services/auth.api.js
- client/src/services/admin.api.js
- client/src/lib/axios.js
- client/src/store/slices/authSlice.js

Backend:
- server/src/controllers/admin.controller.js
- server/src/controllers/auth.controller.js
- server/src/routes/admin.routes.js
- server/src/routes/auth.routes.js
- server/src/models/user.model.js
- server/src/services/email.service.js

All reads were performed without modifying code.

---

## Findings (mapped to requested audit points)

### 1) Why AdminOnboarding "Next" button may appear to not work

Evidence:
- `client/src/pages/onboarding/AdminOnboarding.jsx` uses a mutation that calls `adminApi.updateAdminProfile`:
  - Line: `mutationFn: (data) => adminApi.updateAdminProfile(data),`
- `client/src/services/admin.api.js` defines `updateProfile` (PATCH `/admin/profile`) but **does NOT export `updateAdminProfile`** (the available function name is `updateProfile`).
  - `admin.api.js` exports `updateProfile: async (data) => api.patch("/admin/profile", data)`

Effect:
- Clicking "Next" calls `handleNext()` -> `updateProfileMutation.mutate(data)` -> mutationFn attempts to call `adminApi.updateAdminProfile`, which is `undefined`. This throws a runtime error when invoked, so the expected network request never fires and the user does not advance.

Conclusion:
- Root cause: frontend function-name mismatch (typo/inconsistent API surface). See exact lines above.


### 2) Whether form validation blocks submission

Evidence:
- `AdminOnboarding.jsx` does client-side controlled inputs but **no explicit validation logic** is present in the component (no required checks before calling `mutate`).
- The mutation handler relies on backend validation errors to surface failures.

Effect:
- There is no client-side validation preventing submission — the component will call the mutation on Next regardless of empty fields. Therefore the submission is not blocked by client validation.

Conclusion:
- No client-side validation blocking the button; submission is prevented by the `adminApi.updateAdminProfile` missing function (see #1).


### 3) Whether button type is wrong (`type="button"` vs `type="submit"`)

Evidence:
- Buttons in `AdminOnboarding.jsx` are plain `<button>` elements without explicit `type` attribute. By HTML default, a `<button>` inside a form defaults to `type="submit"`, but this component does *not* wrap inputs in a `<form>` element.

Effect:
- Because there is no `<form>` and no `type` set, button behavior is determined by `onClick`. Using `onClick` is acceptable here; `type` is not the cause of the observed problem.

Conclusion:
- Button `type` is not the problem (component uses `onClick` and no `<form>` is present). No change required toward `type` specifically, but converting to a `<form onSubmit>` would be an option.


### 4) Whether `onSubmit` is wired correctly

Evidence:
- There is no `<form>` element and therefore no `onSubmit` handler in `AdminOnboarding.jsx`.
- The component uses `onClick={handleNext}` on the Next button.

Effect:
- `onSubmit` is not applicable here. The click handler drives submission.

Conclusion:
- No `onSubmit` wiring exists; submit flow uses the `onClick` handler.


### 5) Whether state updates are broken

Evidence:
- `AdminOnboarding.jsx` manages `currentStep` and `formData` via `useState`.
- Updating logic `handleInputChange` uses `setFormData(prev => ({ ...prev, [section]: { ...prev[section], [name]: value } }))` which is correct.
- After a successful mutation, `onSuccess` calls `setCurrentStep(2)` or `navigate(...)` which is proper.
- However, `updateProfileMutation` usage relies on `adminApi.updateAdminProfile` (missing), so the mutation never actually executes; therefore success callbacks don't run.

Effect:
- State update logic is correct but never triggered because the mutation call fails (due to missing function).

Conclusion:
- State update code is correct; the mutation call failing prevents state transition in practice.


### 6) Whether step navigation logic is broken

Evidence:
- Step navigation is controlled by `currentStep` and `setCurrentStep(2)` on mutation `onSuccess`.
- `handleNext` selects `data` based on `currentStep` and calls `updateProfileMutation.mutate(data)`.

Effect:
- Navigation logic itself is fine, but depends on a working mutation. Because the mutation function is undefined, the step never advances.

Conclusion:
- Navigation logic is correct but blocked by the broken mutation call (typo in API function name).


### 7) Whether admin users page has create-user UI

Evidence:
- `client/src/pages/dashboard/Admin/UserManagement.jsx` inspected. The page shows filter, table, actions dropdown, status controls, and pagination.
- There is **no Create User button, modal, or UI** in `UserManagement.jsx`.

Conclusion:
- Admin users page currently lacks Create User UI. This must be implemented in frontend (Phase 3).


### 8) Whether backend create-user endpoint supports admin-created users

Evidence:
- `server/src/controllers/admin.controller.js` contains `createUser` (exported at bottom). Implementation flow:
  - Validates required fields, email format, password strength, role validity, and duplicate email (`User.findOne`).
  - Creates the user via `User.create({ ... })`.
  - If `role === ROLES.ADMIN`, sets `user.adminProfile = getDefaultAdminProfile();`
  - Generates an email verification token and **sends a verification email** via `emailService.sendVerificationEmail`.

- `server/src/routes/admin.routes.js` mounts admin routes and applies `protect` and `allowRoles(ROLES.ADMIN)` at router-level (`router.use(protect, allowRoles(ROLES.ADMIN));`) and includes `router.post('/users', createUser)`.

Effect:
- Backend does accept admin-created users via `POST /api/admin/users` protected by auth + role middleware.
- However, current behavior sends a verification email rather than auto-marking email verified. It also sets `user.adminProfile = getDefaultAdminProfile()` but does not explicitly set `adminProfile.onboardingCompleted` (see model notes below).

Conclusion:
- Endpoint exists and is protected; it creates users and sends an email verification. It does not auto-mark `isEmailVerified` for admin-created users.


### 9) Whether email verification can be auto-marked true for admin-created users

Evidence:
- `createUser` currently generates a verification token and calls `emailService.sendVerificationEmail(...)` unconditionally.
- The code DOES NOT set `user.isEmailVerified = true` for created users.

Effect:
- Admin-created users will receive a verification email and must verify via the standard flow; emailVerified is not auto-true.

Conclusion:
- Currently, auto-marking `isEmailVerified = true` for admin-created users is **not implemented**. This is a behavior change that would be implemented in Phase 4 per instructions.


## Additional related notes discovered during the read-only audit

- `client/src/services/admin.api.js` function names vs `AdminOnboarding.jsx`:
  - `admin.api.js` exports `getProfile` and `updateProfile`.
  - `AdminOnboarding.jsx` uses `adminApi.updateAdminProfile` (mismatched name) — this is the primary defect causing the Next flow to fail.

- Mutation status property naming:
  - `AdminOnboarding.jsx` disables the Next button with `disabled={updateProfileMutation.isPending}`. The mutation object from `@tanstack/react-query` exposes `isLoading`, `isError`, `isSuccess`, etc.; `isPending` is not a standard field. This is a minor mismatch; it does not prevent clicks but is an inconsistency that should be corrected (use `isLoading`).

- Admin profile onboarding flag handling on backend:
  - `server/src/models/user.model.js` now contains `adminProfile` schema with `onboardingCompleted: { type: Boolean, default: false, index: true }` (so model has that property defined).
  - But `createUser` sets `user.adminProfile = getDefaultAdminProfile()` which returns an object without `onboardingCompleted`. Because `adminProfile` is explicitly assigned, Mongoose will not automatically apply the nested `onboardingCompleted` default when the property is missing from the assigned object. To ensure the field exists and is false, the controller should explicitly set `user.adminProfile.onboardingCompleted = false` when creating admin users.

- Consistency between `auth.controller.me` and `admin.controller.getAdminProfile`:
  - `auth.controller.me` inspects patient/doctor profiles and `adminProfile?.onboardingCompleted` for admin (returns actual flag). (This was fixed earlier.)
  - `admin.controller.getAdminProfile` currently returns `user: { ...user.toObject(), isOnboardingCompleted: true }` unconditionally (line returns `isOnboardingCompleted: true`). That causes `/admin/profile` calls to always report onboarding completed = true to the frontend, even if the adminProfile indicates otherwise. This is an inconsistency that will cause UX issues; frontend logic using `/admin/profile` may believe admin is already onboarded.

- API function naming consistency:
  - Several frontend modules refer to slightly different names (`getAdminProfile`, `getProfile`, `updateProfile`, `updateAdminProfile`). Standardize names to avoid runtime errors.


## Per-item trace (where to change / evidence lines)

- AdminOnboarding mutation call:
  - [client/src/pages/onboarding/AdminOnboarding.jsx](client/src/pages/onboarding/AdminOnboarding.jsx#L22-L30)
    - `mutationFn: (data) => adminApi.updateAdminProfile(data)`

- admin.api functions:
  - [client/src/services/admin.api.js](client/src/services/admin.api.js#L1-L14)
    - `updateProfile: async (data) => api.patch("/admin/profile", data)`
    - `getProfile: async () => api.get("/admin/profile")`

- mutation disable flag usage (non-standard):
  - [client/src/pages/onboarding/AdminOnboarding.jsx](client/src/pages/onboarding/AdminOnboarding.jsx#L131)
    - `disabled={updateProfileMutation.isPending}` (should be `isLoading`)

- User management page (no create UI):
  - [client/src/pages/dashboard/Admin/UserManagement.jsx](client/src/pages/dashboard/Admin/UserManagement.jsx) — no create button or modal present.

- Backend create user:
  - [server/src/controllers/admin.controller.js](server/src/controllers/admin.controller.js#L230-L330)
    - `const user = await User.create({...})`
    - `if (role === ROLES.ADMIN) { user.adminProfile = getDefaultAdminProfile(); }`
    - Generates email verification token and calls `emailService.sendVerificationEmail(...)`

- Backend admin/profile returns onboarding complete unconditionally:
  - [server/src/controllers/admin.controller.js](server/src/controllers/admin.controller.js#L52-L66)
    - `user: { ...user.toObject(), isOnboardingCompleted: true }`

- User model adminProfile onboarding field:
  - [server/src/models/user.model.js](server/src/models/user.model.js#L1-L140) — includes `adminProfile.onboardingCompleted: { type: Boolean, default: false, index: true }` (verify exact line in file)

- Email service behavior:
  - [server/src/services/email.service.js](server/src/services/email.service.js#L1-L120) — `sendVerificationEmail` sends an email using nodemailer.


---

## Immediate Recommendations (high level, no code changed yet)

1. **Frontend fixes (Phase 2 & 3)**
   - Rename `adminApi.updateProfile` to `updateAdminProfile` or update `AdminOnboarding.jsx` to call `adminApi.updateProfile` (keep names consistent).
   - Replace `updateProfileMutation.isPending` with `updateProfileMutation.isLoading`.
   - Implement a Create User button + modal in `UserManagement.jsx` (Phase 3).

2. **Backend fixes (Phase 4)**
   - Modify `createUser` to set `user.isEmailVerified = true` and **do not send verification email** when created by admin.
   - When creating admin user, explicitly set `user.adminProfile.onboardingCompleted = false` so the flag is present and correct.
   - Update `admin.controller.getAdminProfile` to return the real `adminProfile.onboardingCompleted` value instead of hardcoded `true`.

3. **Consistency & UX**
   - Standardize API function names across frontend code (`getProfile` vs `getAdminProfile`, `updateProfile` vs `updateAdminProfile`).
   - Add client-side validation in `AdminOnboarding.jsx` (required fields, email format, basic password checks if applicable).

---

## Next step (awaiting confirmation)

Per your requirement, this is the read-only audit. I will not modify code until you confirm to proceed with implementation. After your approval I will:

- Implement the minimal fixes required for the Next button (name mismatch + isLoading fix) and ensure step transitions work.
- Implement backend changes per Phase 4 (auto-mark `isEmailVerified` when admin creates user, initialize `adminProfile.onboardingCompleted`).
- Add Create User UI/modal in `UserManagement.jsx` and wire the POST flow.
- Produce `ADMIN_USER_FLOW_FIX_REPORT.md` after changes and verification.

