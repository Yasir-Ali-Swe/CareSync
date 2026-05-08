# PHASE 3: SECURITY HARDENING - GAP REPORT

**Date:** May 9, 2026  
**Phase:** PHASE 3 - Security Hardening  
**Status:** PRE-IMPLEMENTATION AUDIT

---

## OVERVIEW

PHASE 3 focuses on hardening the server against cross-origin abuse and unsafe file uploads:
- Restrict CORS to trusted origins only
- Validate MIME types before files reach Cloudinary
- Improve upload security around avatars, certificates, and chat attachments

---

## FIX #1: PERMISSIVE CORS POLICY

### Issue Location
**File:** [server/src/app.js](server/src/app.js#L20-L28)

### Current Code (OVERLY PERMISSIVE)
```javascript
app.use(
  cors({
    origin: true,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  }),
);
```

### Root Cause
- `origin: true` reflects any incoming Origin header
- That allows any browser origin to make credentialed requests if the browser sends them
- This is too permissive for a session-based app using cookies and JWT refresh flow

### Related CORS Surface
**File:** [server/src/server.js](server/src/server.js#L13-L19)
```javascript
const io = new Server(httpServer, {
  cors: {
    origin: env.FRONTEND_URL,
    credentials: true,
  },
});
```

### Environment Source
**File:** [server/src/config/env.js](server/src/config/env.js#L18)
```javascript
FRONTEND_URL: process.env.FRONTEND_URL || "http://localhost:5173/",
```

### Root Cause Details
- Express CORS is currently reflection-based
- Socket.IO is restricted, but Express API is not
- `FRONTEND_URL` already exists as a trusted source, so the app can safely enforce an allowlist
- Default value includes a trailing slash, which should be normalized before comparison

### Impact
- Any browser origin can attempt credentialed requests
- Increases CSRF / cross-origin abuse surface
- Weakens the trust boundary between frontend and backend

### Fix Implementation
- Replace `origin: true` with an allowlist callback
- Normalize configured frontend origin(s)
- Reject non-matching browser origins with a clear error

---

## FIX #2: MISSING MIME WHITELIST VALIDATION

### Issue Location
**File:** [server/src/middlewares/upload.middleware.js](server/src/middlewares/upload.middleware.js#L1-L17)

### Current Code (TOO BROAD)
```javascript
const fileFilter = (req, file, cb) => {
  if (!file.mimetype) {
    return cb(new Error("Invalid file"), false);
  }
  cb(null, true);
};
```

### Root Cause
- Only checks that a mimetype exists
- Accepts any MIME type, including unexpected or unsafe ones
- Upload pipeline relies on Cloudinary `resource_type: "auto"`, which is flexible but should be constrained earlier

### Current Upload Entry Points
- Avatars: [server/src/routes/doctor.routes.js](server/src/routes/doctor.routes.js#L27-L34)
- Patient avatars: [server/src/routes/patient.routes.js](server/src/routes/patient.routes.js#L20-L26)
- Certificates: [server/src/routes/doctor.routes.js](server/src/routes/doctor.routes.js#L34)
- Chat attachments: [server/src/routes/chat.routes.js](server/src/routes/chat.routes.js#L18)

### Current UI Expectations
- Avatar inputs use `accept="image/*"` in multiple client forms
- Doctor certificate input is unrestricted in the UI
- Chat message attachments are unrestricted in the UI

### Impact
- Unsafe or unexpected file types can pass through to Cloudinary
- Increases storage abuse and content-type confusion risk
- Makes server-side trust dependent on the client UI

### Fix Implementation
- Add route-aware MIME whitelisting in the upload middleware
- Only allow known safe types for each upload field
- Reject all other MIME types with a 400-style error

---

## FIX #3: UPLOAD SECURITY VALIDATION NEEDS FIELD-AWARE RULES

### Issue Location
**File:** [server/src/middlewares/upload.middleware.js](server/src/middlewares/upload.middleware.js#L1-L17)

### Current Code (NO FIELD CONTEXT)
```javascript
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
});
```

### Root Cause
The middleware currently has no route-specific validation logic. That means:
- Avatar uploads and certificate uploads are treated the same
- Chat attachments are treated the same as profile images
- A single broad rule is used for all upload surfaces

### Security Gap
Different file endpoints have different trust requirements:
1. **Avatar**: image only
2. **Certificate**: documents/images only
3. **Chat attachment**: broader but still whitelisted

### Better Validation Model
Use the field name to determine the acceptable MIME set:
- `avatar` → image-only whitelist
- `certificate` → document/image whitelist
- `attachment` → broader but still explicitly allowed whitelist

### Impact
- Without field-aware rules, the server cannot enforce the intended file policy
- A future client bug could send a wrong file type and it would still pass

### Fix Implementation
- Define allowed MIME sets by field name
- Reject any file whose `mimetype` is not in the set for that field
- Keep file size limit unchanged unless explicitly needed

---

## BACKEND UPLOAD FLOW ANALYSIS

### Avatar Flow
1. Client uploads image via onboarding or profile form
2. `upload.single("avatar")` parses file
3. Controller sends `req.file.buffer` to `cloudinaryService.uploadImage()`
4. Result stored in profile and `User.profileImageUrl`

### Certificate Flow
1. Client uploads file via doctor professional details
2. `upload.single("certificate")` parses file
3. Controller sends `req.file.buffer` to `cloudinaryService.uploadFile()`
4. Result stored in `DoctorProfile.courses[n].certificateUrl`

### Chat Attachment Flow
1. Client uploads file in chat input
2. `upload.single("attachment")` parses file
3. Controller sends `req.file.buffer` to `cloudinaryService.uploadFile()`
4. Message stores attachment metadata

### Existing Safety Positives
- Memory storage avoids writing untrusted uploads to local disk
- File size limit already caps uploads at 10 MB
- Cloudinary upload is isolated behind a service layer

### Remaining Weakness
- MIME type acceptance is effectively open-ended
- Express CORS is still open to all origins

---

## RECOMMENDED MIME POLICY

### Avatar Files
Allow only:
- `image/jpeg`
- `image/png`
- `image/webp`

### Certificate Files
Allow only:
- `image/jpeg`
- `image/png`
- `image/webp`
- `application/pdf`

### Chat Attachments
Allow only:
- `image/jpeg`
- `image/png`
- `image/webp`
- `application/pdf`
- `text/plain`
- `application/msword`
- `application/vnd.openxmlformats-officedocument.wordprocessingml.document`

### Note
This is intentionally narrow. If a new file type is needed later, it should be added explicitly.

---

## REGRESSION RISKS

### CORS Restriction
- Medium risk: environments that rely on a different frontend origin will need `FRONTEND_URL` updated
- Mitigation: use the existing env variable as the source of truth

### MIME Whitelist
- Medium risk: existing users may upload files outside the new whitelist
- Mitigation: keep the whitelist aligned with actual UI use cases and communicate any policy changes

### Upload Validation
- Low risk: the upload pipeline already uses `multer.memoryStorage()` and Cloudinary services
- Mitigation: no local disk path changes required

---

## FILES TO MODIFY

1. [server/src/app.js](server/src/app.js) - Restrict Express CORS origin handling
2. [server/src/server.js](server/src/server.js) - Normalize and reuse frontend origin for Socket.IO CORS
3. [server/src/middlewares/upload.middleware.js](server/src/middlewares/upload.middleware.js) - Add MIME whitelist validation

---

## VALIDATION CHECKLIST

- [ ] Browser requests from untrusted origins are rejected
- [ ] Allowed frontend origin still works with credentials
- [ ] Avatar uploads accept only image MIME types
- [ ] Certificate uploads reject unsupported MIME types
- [ ] Chat attachments reject unsupported MIME types
- [ ] Existing profile image uploads still succeed
- [ ] Build passes after changes

---

## READY FOR IMPLEMENTATION

✅ Root causes identified  
✅ Upload entry points mapped  
✅ Existing client file types reviewed  
✅ No new dependencies required  
