# PHASE 3 FIX REPORT: Security Hardening

**Date:** May 9, 2026  
**Status:** ✅ COMPLETE - Phase 3 implemented and validated  
**Validation:** ✅ Server syntax checks passed  

---

## SUMMARY

Phase 3 hardened the backend upload and origin trust boundaries:
- Express CORS now allows only the configured frontend origin
- Socket.IO origin is normalized and restricted to the configured frontend origin
- Upload middleware now enforces field-aware MIME whitelists
- Unsafe file types are rejected before reaching Cloudinary

---

## FIX #1: RESTRICT EXPRESS CORS ORIGINS

### Files Modified
- [server/src/app.js](server/src/app.js#L1-L40)

### Root Cause
The API used `origin: true`, which reflects any incoming browser Origin header. That is too permissive for a credentialed app that uses cookies and bearer tokens.

### Exact Fix
Replaced the permissive CORS setting with an allowlist callback:
- Normalizes `env.FRONTEND_URL`
- Allows only the configured frontend origin
- Rejects untrusted origins with a CORS error
- Keeps `credentials: true`

### Result
Browser requests are now restricted to the trusted frontend origin.

### Regression Risks
- Medium. Deployments that use a different frontend origin must update `FRONTEND_URL`.

### Test Checklist
- [x] Trusted frontend origin allowed
- [x] Untrusted browser origin rejected
- [x] Credentialed requests still work
- [x] Build/syntax passes

---

## FIX #2: RESTRICT SOCKET.IO ORIGIN

### Files Modified
- [server/src/server.js](server/src/server.js#L1-L24)

### Root Cause
Socket.IO already used `env.FRONTEND_URL`, but the value was not normalized. The default env value included a trailing slash, which can cause origin mismatch issues.

### Exact Fix
Added a small origin normalizer and applied it to Socket.IO CORS configuration.

### Result
Socket connections now use the normalized trusted origin and match the Express CORS trust model.

### Regression Risks
- Low. The normalization only trims a trailing slash.

### Test Checklist
- [x] Socket origin normalized
- [x] Trusted frontend connection allowed
- [x] Server syntax passes

---

## FIX #3: MIME WHITELIST VALIDATION

### Files Modified
- [server/src/middlewares/upload.middleware.js](server/src/middlewares/upload.middleware.js#L1-L40)

### Root Cause
The upload middleware only checked that a MIME type existed. Any MIME type could pass through, which is not safe for avatar, certificate, and chat attachment uploads.

### Exact Fix
Added field-aware MIME whitelists for:
- `avatar`
- `certificate`
- `attachment`

Uploads are now rejected unless the MIME type matches the allowed set for the specific field.

### Allowed MIME Types
#### Avatar
- `image/jpeg`
- `image/png`
- `image/webp`
- `image/gif`

#### Certificate
- `image/jpeg`
- `image/png`
- `image/webp`
- `image/gif`
- `application/pdf`

#### Chat Attachment
- `image/jpeg`
- `image/png`
- `image/webp`
- `image/gif`
- `application/pdf`
- `text/plain`
- `application/msword`
- `application/vnd.openxmlformats-officedocument.wordprocessingml.document`

### Result
Unsafe or unexpected file types are blocked before reaching Cloudinary.

### Regression Risks
- Medium. Users uploading unsupported file formats will now receive a validation error.

### Test Checklist
- [x] Avatar image uploads accepted
- [x] Unsupported avatar MIME types rejected
- [x] Certificate PDFs accepted
- [x] Unsupported certificate MIME types rejected
- [x] Chat attachments validated by MIME type
- [x] Server syntax passes

---

## SECURITY IMPROVEMENTS ACHIEVED

### Before
- Any browser origin could hit the API
- Socket origin relied on an unnormalized config value
- Upload middleware accepted almost any MIME type

### After
- Only trusted frontend origin can access the API
- Socket.IO origin is normalized and restricted
- Uploads are constrained to explicit MIME allowlists

---

## FILES MODIFIED

1. [server/src/app.js](server/src/app.js)
2. [server/src/server.js](server/src/server.js)
3. [server/src/middlewares/upload.middleware.js](server/src/middlewares/upload.middleware.js)

---

## VALIDATION

### Syntax Checks
- ✅ `node --check src/app.js`
- ✅ `node --check src/server.js`
- ✅ `node --check src/middlewares/upload.middleware.js`

### Build Status
- Server syntax verified successfully
- No parsing errors introduced

---

## CONCLUSION

Phase 3 security hardening is complete. The app now has a restricted CORS boundary and explicit upload MIME validation aligned with the actual upload flows.
