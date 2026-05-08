# Doctor Dashboard Profile Data Mapping Bug - ROOT CAUSE ANALYSIS

## Executive Summary
Doctor onboarding saves correctly to database, and API returns correct data. **However, the frontend dashboard profile page NEVER fetches real doctor data from the server.** Instead, it displays hardcoded dummy data from `doctorInitialProfile`. Additionally, there is a field name mismatch in the courses array causing certificate data loss.

---

## STEP 1: ONBOARDING PAYLOAD STRUCTURE ✅

### Frontend Submission Flow (Per Step)
- **Step 1 (PersonalInfoStep)**: `{ personalInfo: { fullName, email, birthDate, gender, avatarUrl } }`
- **Step 2 (EducationStep)**: `{ education: [{ degree, institution, startYear, endYear }] }`
- **Step 3 (ClinicDetailsStep)**: `{ clinics: [{ name, address: { line1, city, province, postalCode }, type, contactNumber }] }`
- **Step 4 (ProfessionalDetailsStep)**: `{ specialization, yearsExperience, consultationFee, courses: [{ name, certificate }] }`
- **Step 5 (BioStep)**: `{ bio, skills: [String], languages: [String] }`
- **Step 6 (AvailabilityStep)**: `{ schedule: [{ day, slots: [{ start, end }] }] }`

**Endpoint**: `PATCH /doctor/onboarding`
**File**: [/client/src/components/onboarding/DoctorOnboardingStep/AvailabilityStep.jsx](AvailabilityStep.jsx#L44)

---

## STEP 2: DATABASE SCHEMA STRUCTURE ✅

### DoctorProfile Model Schema
```javascript
{
  personalInfo: {
    avatarUrl: String,
    fullName: String,
    email: String,
    birthDate: Date,
    gender: String (enum: GENDERS)
  },
  education: [{
    degree: String,
    institution: String,
    startYear: String,
    endYear: String
  }],
  clinics: [{
    name: String,
    address: {
      line1: String,
      city: String,
      province: String,
      postalCode: String
    },
    type: String (enum: "private", "government", "hospital", "telehealth", ""),
    contactNumber: String
  }],
  specialization: String,
  yearsExperience: String,
  consultationFee: String,
  courses: [{
    name: String,
    certificateUrl: String  // <-- KEY SCHEMA FIELD
  }],
  bio: String,
  skills: [String],
  languages: [String],
  schedule: [{
    day: String,
    slots: [{
      start: String,
      end: String
    }]
  }],
  verified: Boolean,
  onboardingCompleted: Boolean
}
```

**File**: [/server/src/models/doctorProfile.model.js](doctorProfile.model.js#L1-L70)

---

## STEP 3: PROFILE FETCH API RESPONSE ✅

### GET /doctor/profile Endpoint
**Backend Handler**: `getDoctorProfile()` in [/server/src/controllers/doctor.controller.js](doctor.controller.js#L119-L128)

```javascript
export const getDoctorProfile = asyncHandler(async (req, res) => {
  const profile = await DoctorProfile.findOne({ user: req.user._id });
  
  if (!profile) {
    return res.status(404).json({ success: false, message: "Doctor profile not found" });
  }
  
  return res.status(200).json({ success: true, data: { profile } });
});
```

**Response Structure**:
```json
{
  "success": true,
  "data": {
    "profile": {
      "personalInfo": { ... },
      "education": [ ... ],
      "clinics": [ ... ],
      "specialization": "...",
      "yearsExperience": "...",
      "consultationFee": "...",
      "courses": [{ "name": "...", "certificateUrl": "..." }],
      "bio": "...",
      "skills": [ ... ],
      "languages": [ ... ],
      "schedule": [ ... ],
      "onboardingCompleted": true
    }
  }
}
```

---

## STEP 4: DASHBOARD PROFILE PAGE HYDRATION ❌❌❌ CRITICAL BUG FOUND

### File: [/client/src/components/dashboard/profile/ProfileFlowPage.jsx](ProfileFlowPage.jsx#L1-L150)

**CRITICAL ISSUE**: ProfileFlowPage **NEVER FETCHES** real doctor profile data.

```jsx
const ProfileFlowPage = ({ title, steps, totalSteps, initialProfile }) => {
  const [currentStep, setCurrentStep] = React.useState(1);
  const [profile, setProfile] = React.useState(() => clone(initialProfile)); // <-- USES HARDCODED DATA
  const [loading, setLoading] = React.useState(false);
  const [status, setStatus] = React.useState(null);
  
  // NO useEffect here to fetch data!
  // NO API call to `/doctor/profile`
  // NO hydration from server!
  ...
};
```

### File: [/client/src/pages/dashboard/Doctor/Profile.jsx](Profile.jsx#L1-L10)

```jsx
import ProfileFlowPage from "@/components/dashboard/profile/ProfileFlowPage";
import { doctorProfileConfig } from "@/components/dashboard/profile/profileFlowConfigs";

const Profile = () => <ProfileFlowPage {...doctorProfileConfig} />; // Passes doctorProfileConfig which has hardcoded initialProfile
```

### File: [/client/src/components/dashboard/profile/profileFlowConfigs.jsx](profileFlowConfigs.jsx#L1815-1871)

```jsx
const doctorProfileConfig = createConfig(
  "",
  [ /* 6 steps config */ ],
  doctorInitialProfile, // <-- HARDCODED INITIAL DATA
);
```

---

## STEP 5: HARDCODED INITIAL DATA COMPARISON ❌

### What's In Code (doctorInitialProfile)
**File**: [/client/src/components/dashboard/profile/profileFlowConfigs.jsx](profileFlowConfigs.jsx#L1683-L1745)

```javascript
const doctorInitialProfile = {
  personalInfo: {
    avatarUrl: "",
    fullName: "Dr. Hamza Ali", // <-- WRONG! Hardcoded dummy name
    email: "hamza.ali@example.com", // <-- WRONG! Hardcoded dummy email
    birthDate: "1987-02-21", // <-- WRONG! Hardcoded dummy date
    gender: "male",
  },
  education: [
    {
      degree: "MBBS",
      institution: "King Edward Medical University",
      startYear: "2005",
      endYear: "2010",
    },
    {
      degree: "FCPS Part 2 / Fellowship",
      institution: "College of Physicians and Surgeons Pakistan",
      startYear: "2013",
      endYear: "2016",
    },
  ],
  clinics: [
    {
      name: "City Care Hospital",
      address: {
        line1: "27-M, Main Boulevard, DHA Phase 5",
        city: "Lahore",
        province: "Punjab",
        postalCode: "54000",
      },
      type: "private",
      contactNumber: "+92 42 5550199",
    },
  ],
  specialization: "Cardiology", // <-- WRONG! Hardcoded dummy specialization
  yearsExperience: "12",
  consultationFee: "4500",
  courses: [ /* ... */ ], // <-- WRONG! Hardcoded dummy courses
  bio: "Board-certified cardiologist...", // <-- WRONG! Hardcoded dummy bio
  skills: ["Diagnosis", "Patient Care"],
  languages: ["English", "Urdu"],
  schedule: weekDays.map((day, index) => ({
    day,
    slots: index < 5 ? [{ start: "09:00", end: "13:00" }, ...] : ...,
  })),
};
```

### What's Actually in Database  
**Example**: Doctor who completed onboarding with:
- fullName: "Dr. Fatima Ahmed"
- email: "fatima.ahmed@hospital.com"
- specialization: "Gynecology"
- yearsExperience: "8"
- courses: [{ name: "Advanced Obstetrics", certificateUrl: "https://..." }]

**Result**: Dashboard shows "Dr. Hamza Ali" + "Cardiology" from hardcoded data instead of actual doctor's data.

---

## STEP 6: ARRAY FIELD MAPPINGS - CERTIFICATE BUG ❌

### Bug: `certificate` vs `certificateUrl` Mismatch

**In Frontend Code (doctorInitialProfile)**:
```javascript
courses: [
  { name: "Advanced Cardiac Life Support", certificate: null }, // <-- WRONG FIELD NAME
  { name: "Echocardiography Workshop", certificate: null },     // <-- WRONG FIELD NAME
]
```
**File**: [profileFlowConfigs.jsx lines 1722-1723](profileFlowConfigs.jsx#L1722-L1723)

**In Frontend Code (DoctorProfessionalDetailsStep)**:
```javascript
{courses.map((course, index) => (
  <div key={index} ...>
    <Input
      type="file"
      onChange={(e) => {
        const next = clone(courses);
        next[index].certificate = e.target.files?.[0] || null; // <-- SETTING WRONG FIELD
        setCourses(next);
      }}
    />
  </div>
))}
```
**File**: [profileFlowConfigs.jsx line 1262](profileFlowConfigs.jsx#L1262)

**Adding new course**:
```javascript
setCourses([...courses, { name: "", certificate: null }]) // <-- WRONG FIELD
```
**File**: [profileFlowConfigs.jsx line 1285](profileFlowConfigs.jsx#L1285)

**In Backend Database Schema**:
```javascript
courses: [
  {
    name: { type: String, default: "" },
    certificateUrl: { type: String, default: "" }, // <-- CORRECT FIELD NAME
  },
]
```
**File**: [doctorProfile.model.js lines 57-62](doctorProfile.model.js#L57-L62)

**Impact**: 
- When doctor uploads a certificate during onboarding, it saves to `courses[i].certificate` in form state
- But form submission sends `certificate` field
- Backend might reject or ignore the field (depending on how `upsertDoctorOnboarding` handles it)
- Even if saved, it's in wrong field name, so retrieval gets undefined/null

---

## ROOT CAUSE SUMMARY

### Root Cause 1: No Data Fetch
| Component | Issue | File | Line |
|-----------|-------|------|------|
| ProfileFlowPage | Never calls API to fetch real doctor profile data | ProfileFlowPage.jsx | 9 |
| Doctor Profile Step Configs | Uses hardcoded `doctorInitialProfile` instead of fetching from server | profileFlowConfigs.jsx | 1815 |
| Doctor Profile Page Wrapper | Passes hardcoded config instead of loading real data | Profile.jsx | 5 |

**Fix Required**: Add `useEffect` + `useQuery` to fetch `/doctor/profile` and hydrate real data into profile state.

---

### Root Cause 2: Field Name Mismatch
| Location | Field Used | Should Be | File | Line |
|----------|-----------|-----------|------|------|
| doctorInitialProfile | `certificate` | `certificateUrl` | profileFlowConfigs.jsx | 1722 |
| DoctorProfessionalDetailsStep (file upload handler) | `certificate` | `certificateUrl` | profileFlowConfigs.jsx | 1262 |
| DoctorProfessionalDetailsStep (add course) | `certificate` | `certificateUrl` | profileFlowConfigs.jsx | 1285 |

**Fix Required**: Replace all `certificate` with `certificateUrl` in frontend code.

---

## EXPECTED vs ACTUAL BEHAVIOR

### Scenario: Doctor "Ali Khan" Completed Onboarding with Custom Data

**Expected Dashboard Display**:
```
Name: Ali Khan
Email: ali.khan@hospital.pk
Specialization: Orthopedics
Years Experience: 10
Consultation Fee: 5000
Courses: [
  { name: "Joint Replacement Surgery", certificateUrl: "https://..." },
  { name: "Arthroscopy Advanced", certificateUrl: "https://..." }
]
```

**Actual Dashboard Display**:
```
Name: Dr. Hamza Ali           ❌ WRONG: Hardcoded dummy data
Email: hamza.ali@example.com  ❌ WRONG: Hardcoded dummy data
Specialization: Cardiology    ❌ WRONG: Hardcoded dummy data
Years Experience: 12          ❌ WRONG: Hardcoded dummy data
Consultation Fee: 4500        ❌ WRONG: Hardcoded dummy data
Courses: [
  { name: "...", certificate: null } ❌ WRONG: Uses wrong field name
]
```

---

## DETAILED FIXES REQUIRED

### Fix 1: Add Data Fetching to ProfileFlowPage
**What to do**:
- Add `useEffect` hook to fetch from `/doctor/profile` API
- Load real profile data when component mounts
- Merge fetched data into profile state
- Show loading state while fetching

### Fix 2: Fix Certificate Field Name
**What to do**:
- Replace `certificate` → `certificateUrl` in all 3 locations
- Ensure new course object uses `certificateUrl: null`
- Ensure file upload handler sets `certificateUrl` (keep as URL string, not file object)

---

## FILES REQUIRING CHANGES

1. [/client/src/components/dashboard/profile/ProfileFlowPage.jsx](ProfileFlowPage.jsx)
   - Add useEffect for data fetching
   - Add loading/error states

2. [/client/src/components/dashboard/profile/profileFlowConfigs.jsx](profileFlowConfigs.jsx)
   - Line 1722: Change `certificate: null` → `certificateUrl: null`
   - Line 1262: Change `certificate = e.target.files?.[0]` → `certificateUrl = ...` (handle file upload)
   - Line 1285: Change `certificate: null` → `certificateUrl: null`

3. [/client/src/services/doctor.api.js](doctor.api.js)
   - Add `getDoctorProfile` function

---

## VERIFICATION CHECKLIST

Once fixes are applied, verify:
- ✅ Dashboard shows doctor's actual name (not "Dr. Hamza Ali")
- ✅ Dashboard shows doctor's actual email (not "hamza.ali@example.com")
- ✅ Dashboard shows doctor's actual specialization  
- ✅ Dashboard shows doctor's actual experience years
- ✅ Dashboard shows doctor's actual consultation fee
- ✅ Dashboard shows doctor's actual education list
- ✅ Dashboard shows doctor's actual clinics
- ✅ Dashboard shows doctor's actual bio
- ✅ Dashboard shows doctor's actual skills/languages
- ✅ Dashboard shows doctor's actual availability schedule
- ✅ Certificate uploads work without errors
- ✅ Certificate field uses `certificateUrl` consistently

---

## IMPACT ANALYSIS

**Severity**: 🔴 **CRITICAL**
- Doctors see wrong profile data (not their own)
- Makes dashboard profile feature unusable
- Certificate feature broken due to field mismatch
- User confusion - "Why is dashboard showing someone else's data?"

**Affected Users**: All doctors using dashboard profile editing feature

**User Impact on Onboarding**:
- Onboarding data saves correctly ✅
- Database stores correctly ✅
- But dashboard shows wrong data after onboarding ❌

