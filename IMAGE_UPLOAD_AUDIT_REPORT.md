# Profile Image Upload Bug - ROOT CAUSE AUDIT REPORT

## Executive Summary
Profile image upload is **INCOMPLETE/NOT FULLY IMPLEMENTED**. Frontend converts file to data URL preview, backend onboarding route has no file handling, Cloudinary upload never happens, and database fields remain empty.

---

## STEP 1: FRONTEND AUDIT ✅ COMPLETE

### Patient PersonalInfoStep
**File**: [/client/src/components/onboarding/PatientOnboardingStep/PersonalInfoStep.jsx](PersonalInfoStep.jsx)

**File Input Handler** (Lines 76-79):
```jsx
const handleImageChange = (e) => {
  const file = e.target.files[0];
  if (file) {
    setImage(URL.createObjectURL(file));  // ❌ WRONG: Creates preview only
  }
};
```

**ISSUE**: 
- ❌ Creates object URL for PREVIEW only (`data:image/png;base64,...`)
- ❌ File object is NOT stored in state
- ❌ Only browser-local preview is created

**Data Submission** (Lines 50-54):
```jsx
await patientApi.submitOnboarding({
  personalInfo: {
    fullName: fullName.trim(),
    email: email.trim(),
    birthDate: date || null,
    gender,
    avatarUrl: image || "",  // ❌ Sends data URL or empty string
  },
});
```

**ISSUE**:
- ❌ Sends `avatarUrl: "data:image/png;base64,..."` (data URL string)
- ❌ Or sends `avatarUrl: ""` if no file selected
- ❌ Either way, it's NOT a real image URL

### Doctor PersonalInfoStep
**File**: [/client/src/components/onboarding/DoctorOnboardingStep/PersonalInfoStep.jsx](PersonalInfoStep.jsx)

**SAME PATTERN**:
- Lines 71-75: Same `handleImageChange` logic
- Lines 50-56: Same `submitOnboarding` with data URL

### Verdict
✅ File input field exists
✅ Image preview works locally
❌ **File is NOT actually stored in state**
❌ **Data URL is sent instead of real file**
❌ **FormData NOT used**

---

## STEP 2: NETWORK/PAYLOAD AUDIT ✅ COMPLETE

### API Service: Patient
**File**: [/client/src/services/patient.api.js](patient.api.js)

```javascript
export const patientApi = {
  submitOnboarding: async (data) => {
    const response = await api.patch("/patient/onboarding", data);
    return response.data;
  },
  ...
};
```

**ISSUE**:
- ❌ Sends raw JSON object via `api.patch()`
- ❌ No FormData construction
- ❌ `Content-Type: application/json` (wrong for files)
- ❌ No multipart/form-data headers

### API Service: Doctor
**File**: [/client/src/services/doctor.api.js](doctor.api.js)

```javascript
export const doctorApi = {
  submitOnboarding: async (data) => {
    const response = await api.patch("/doctor/onboarding", data);
    return response.data;
  },
  ...
};
```

**SAME ISSUE**:
- ❌ Raw JSON submission
- ❌ No file support

### Comparison: How Files SHOULD Be Sent
**File**: [/client/src/services/chat.api.js](chat.api.js) - Shows correct pattern:

```javascript
if (attachment) {
  const formData = new FormData();
  Object.entries(rest).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      formData.append(key, value);
    }
  });
  formData.append("attachment", attachment);  // ✅ Append file object

  const response = await api.post("/chat/messages", formData, {
    headers: {
      "Content-Type": "multipart/form-data",  // ✅ Correct header
    },
  });
  return response.data;
}
```

### Verdict
✅ Axios configured correctly
✅ Other endpoints use FormData (chat.api works)
❌ **submitOnboarding does NOT use FormData**
❌ **submitOnboarding sends JSON instead of multipart**
❌ **File object never appended to FormData**

---

## STEP 3: BACKEND ROUTE AUDIT ✅ COMPLETE

### Patient Onboarding Route
**File**: [/server/src/routes/patient.routes.js](patient.routes.js)

```javascript
import { upload } from "../middlewares/upload.middleware.js";
...
router.patch("/onboarding", upsertPatientOnboarding);  // ❌ NO MULTER
...
router.use(requireOnboardingCompleted());
...
router.post("/profile/avatar", upload.single("avatar"), uploadPatientAvatar);  // ✅ HAS MULTER
```

**ISSUE**:
- ❌ Line 20: `/onboarding` route has **NO** `upload.single()` middleware
- ✅ Line 26: Separate `/profile/avatar` route HAS multer middleware
- ❌ Frontend sends avatar in onboarding route (no file handling)

### Doctor Onboarding Route
**File**: [/server/src/routes/doctor.routes.js](doctor.routes.js)

```javascript
import { upload } from "../middlewares/upload.middleware.js";
...
router.patch("/onboarding", upsertDoctorOnboarding);  // ❌ NO MULTER
...
router.post("/profile/avatar", upload.single("avatar"), uploadDoctorAvatar);  // ✅ HAS MULTER
```

**SAME PATTERN**:
- ❌ Line 27: `/onboarding` route has **NO** multer
- ✅ Line 33: Separate `/profile/avatar` route HAS multer

### Multer Configuration
**File**: [/server/src/middlewares/upload.middleware.js](upload.middleware.js)

```javascript
import multer from "multer";

const storage = multer.memoryStorage();

export const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    // Only allows image files
    const allowedMimes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only image files allowed"));
    }
  },
});
```

**Verdict**: Multer IS configured, but NOT applied to onboarding routes.

### Verdict
✅ Multer middleware exists
✅ `/profile/avatar` has multer protection
❌ **/onboarding route has NO multer middleware**
❌ **Backend can't process file if frontend sends multipart**

---

## STEP 4: CONTROLLER AUDIT ✅ COMPLETE

### Patient Onboarding Controller
**File**: [/server/src/controllers/patient.controller.js](patient.controller.js)

```javascript
export const upsertPatientOnboarding = asyncHandler(async (req, res) => {
  const updates = req.body || {};  // ❌ Only reads JSON body

  let profile = await PatientProfile.findOne({ user: req.user._id });
  if (!profile) {
    profile = await PatientProfile.create({
      user: req.user._id,
      personalInfo: {
        fullName: req.user.fullName,
        email: req.user.email,
      },
    });
  }

  profile.set(updates);  // ❌ Directly assigns whatever is in req.body
  markOnboardingCompleteIfEligible(profile);
  await profile.save();  // ❌ Saves data URL as-is

  return res.status(200).json({
    success: true,
    message: "Patient onboarding/profile updated",
    data: { profile },
  });
});
```

**ISSUES**:
- ❌ Line 19: `const updates = req.body` - Only reads JSON
- ❌ Never checks `req.file` (no file handling)
- ❌ Line 32: Directly saves avatarUrl string (data URL or empty)
- ❌ No Cloudinary upload call
- ❌ Doesn't update User model's `profileImageUrl` field

### Patient Avatar Upload Controller (Correct Pattern)
**File**: [/server/src/controllers/patient.controller.js](patient.controller.js) Lines 98-120

```javascript
export const uploadPatientAvatar = asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: "Avatar image is required" });
  }

  const uploaded = await cloudinaryService.uploadImage(
    req.file.buffer,  // ✅ Reads file from multer
    "caresync/patient/avatars"
  );

  const profile = await PatientProfile.findOneAndUpdate(
    { user: req.user._id },
    { $set: { "personalInfo.avatarUrl": uploaded.secure_url } },  // ✅ Stores real URL
    { new: true, upsert: true },
  );

  return res.status(200).json({
    success: true,
    message: "Patient avatar uploaded",
    data: { avatarUrl: profile.personalInfo.avatarUrl },
  });
});
```

**THIS shows the correct implementation**, but it's on a different route.

### Doctor Onboarding Controller
**File**: [/server/src/controllers/doctor.controller.js](doctor.controller.js)

```javascript
export const upsertDoctorOnboarding = asyncHandler(async (req, res) => {
  const updates = req.body || {};  // ❌ Only reads JSON body

  let profile = await DoctorProfile.findOne({ user: req.user._id });
  
  if (!profile) {
    profile = await DoctorProfile.create({
      user: req.user._id,
      personalInfo: {
        fullName: req.user.fullName,
        email: req.user.email,
      },
    });
  }

  profile.set(updates);  // ❌ Directly assigns whatever is in req.body
  markDoctorOnboardingComplete(profile);
  await profile.save();  // ❌ Saves data URL as-is

  return res.status(200).json({
    success: true,
    message: "Doctor onboarding/profile updated",
    data: { profile },
  });
});
```

**SAME ISSUES** as patient controller.

### Verdict
✅ Cloudinary service exists (proven by uploadPatientAvatar)
✅ Correct upload pattern exists on separate routes
❌ **Onboarding controllers don't check req.file**
❌ **Onboarding controllers don't call Cloudinary**
❌ **Onboarding saves whatever data URL is sent**
❌ **Cloudinary upload NEVER executed during onboarding**

---

## STEP 5: CLOUDINARY AUDIT ✅ COMPLETE

### Service Definition
**File**: [/server/src/services/cloudinary.service.js](cloudinary.service.js)

```javascript
import streamifier from "streamifier";
import cloudinary from "../config/cloudinary.js";

const uploadBuffer = (buffer, options = {}) =>
  new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(options, (error, result) => {
      if (error) return reject(error);
      resolve(result);
    });

    streamifier.createReadStream(buffer).pipe(uploadStream);
  });

export const cloudinaryService = {
  async uploadImage(buffer, folder = "caresync/images") {
    return uploadBuffer(buffer, {
      folder,
      resource_type: "image",
    });
  },

  async uploadFile(buffer, folder = "caresync/files") {
    return uploadBuffer(buffer, {
      folder,
      resource_type: "auto",
    });
  },
};
```

**Verdict**:
✅ Cloudinary upload functions exist
✅ Multiple upload paths exist (uploadImage, uploadFile)
✅ Configuration exists
❌ **Services NEVER CALLED during onboarding**
✅ Services work correctly on separate avatar upload route

---

## STEP 6: DATABASE WRITE AUDIT ✅ COMPLETE

### User Model
**File**: [/server/src/models/user.model.js](user.model.js)

```javascript
profileImageUrl: {
  type: String,
  default: "",
},
```

**Status**: ✅ Field exists
**Updates**: ❌ **NEVER updated by onboarding controller**

### Patient Profile Model
**File**: [/server/src/models/patientProfile.model.js](patientProfile.model.js)

```javascript
personalInfo: {
  avatarUrl: { type: String, default: "" },
  ...
},
```

**Status**: ✅ Field exists
**Updates**: 
- ✅ Updated by onboarding controller
- ❌ Updated with data URL or empty string (WRONG DATA)

### Doctor Profile Model
**File**: [/server/src/models/doctorProfile.model.js](doctorProfile.model.js)

```javascript
personalInfo: {
  avatarUrl: { type: String, default: "" },
  ...
},
```

**Status**: ✅ Field exists
**Updates**:
- ✅ Updated by onboarding controller
- ❌ Updated with data URL or empty string (WRONG DATA)

### Verdict
✅ Database schema has correct fields
❌ **PatientProfile.personalInfo.avatarUrl gets data URL**
❌ **DoctorProfile.personalInfo.avatarUrl gets data URL**
❌ **User.profileImageUrl NEVER updated**
❌ **Both fields remain empty if no image uploaded**

---

## ROOT CAUSE SUMMARY

| Component | Expected | Actual | Status |
|-----------|----------|--------|--------|
| **Frontend: File handling** | Store actual file + preview | Only creates preview URL | ❌ BROKEN |
| **Frontend: FormData construction** | Create FormData, append file | Send JSON with data URL | ❌ BROKEN |
| **Frontend: API call** | `submitOnboarding(formData, multipart headers)` | `submitOnboarding(jsonObject)` | ❌ BROKEN |
| **Backend: Route middleware** | Add `upload.single("avatar")` to `/onboarding` | ❌ NO multer on `/onboarding` | ❌ MISSING |
| **Backend: File reading** | `req.file.buffer` | Only `req.body` read | ❌ MISSING |
| **Backend: Cloudinary upload** | `cloudinaryService.uploadImage(buffer)` | Constructor just saves given avatarUrl | ❌ MISSING |
| **Backend: URL persistence** | Save Cloudinary secure_url | Save data URL or empty | ❌ WRONG |
| **Backend: User model update** | Update both PatientProfile + User model | Only PatientProfile updated (with wrong data) | ❌ MISSING |
| **Database: avatarUrl** | Cloudinary HTTPS URL | data:image/png;base64,... or "" | ❌ EMPTY/WRONG |
| **Database: profileImageUrl** | Cloudinary HTTPS URL | "" (never populated) | ❌ EMPTY |

---

## ROOT CAUSE: INCOMPLETE IMPLEMENTATION

### Primary Cause:
**Onboarding flow was never designed to handle file uploads.** It only handles JSON submissions. The separate avatar upload routes exist but are never used during onboarding.

### Key Missing Pieces:

1. **Frontend**: File not stored in state, FormData never created
2. **Frontend API**: No FormData support in submitOnboarding
3. **Backend Routes**: No multer middleware on `/onboarding`
4. **Backend Controller**: No `req.file` reading, no Cloudinary upload
5. **Database**: User.profileImageUrl never updated

---

## WHAT HAPPENS NOW

**Scenario: User selects avatar during patient onboarding step 1**

1. ✅ File selected
2. ✅ Preview shown locally
3. ❌ File NOT stored in state
4. ✅ Data URL created from preview
5. ✅ Submitted via API: `{ personalInfo: { avatarUrl: "data:image/png;base64,..." } }`
6. ❌ Backend finds NO multer req.file
7. ❌ Backend receives avatarUrl as data URL string
8. ❌ Backend saves data URL directly to database
9. ❌ User.profileImageUrl remains empty
10. ❌ Dashboard shows empty avatar

---

## VERIFICATION CHECKLIST - IS UPLOAD IMPLEMENTED?

- ❌ Is file actually sent to backend as multipart? **NO**
- ❌ Does backend have multer on onboarding? **NO**
- ❌ Does controller check req.file? **NO**
- ❌ Does Cloudinary upload happen? **NO**
- ❌ Does database store real URL? **NO**
- ❌ Is upload end-to-end working? **NO**

### Conclusion
Image upload is **NOT IMPLEMENTED** for onboarding flow. It's partially implemented as separate routes but never used.

---

