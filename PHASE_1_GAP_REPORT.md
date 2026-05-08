# PHASE 1: CRITICAL SECURITY + CORE PRODUCT - GAP REPORT

**Date:** May 8, 2026  
**Phase:** PHASE 1 - Critical Security & Core Product  
**Status:** PRE-IMPLEMENTATION AUDIT

---

## 1. SOCKET ROOM AUTHORIZATION - ROOT CAUSE ANALYSIS

### Issue Location
**File:** [server/src/sockets/socket.handler.js](server/src/sockets/socket.handler.js#L72)

### Current Code (VULNERABLE)
```javascript
socket.on("conversation:join", ({ conversationId }) => {
  if (!conversationId) return;
  socket.join(`conversation:${conversationId}`);  // ❌ NO MEMBERSHIP CHECK
});
```

### Root Cause
- Only validates conversation ID existence, not user participation
- Any authenticated user can join ANY conversation room
- Listening users would receive real-time events from unauthorized conversations

### Contrast with Message Sending (CORRECT)
**File:** [server/src/sockets/socket.handler.js](server/src/sockets/socket.handler.js#L89-L96)
```javascript
socket.on("message:send", async ({ conversationId, text, attachment }) => {
  const conversation = await Conversation.findById(conversationId);
  if (!conversation) return;

  // ✅ CORRECT: Checks participant membership
  const isParticipant = conversation.participants.some(
    (participantId) => String(participantId) === String(socket.data.userId),
  );
  if (!isParticipant) return;
```

### Data Model Reference
**File:** [server/src/models/conversation.model.js](server/src/models/conversation.model.js#L4-L10)
```javascript
participants: [
  {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
],
```

### Attack Vector
1. User A and User B have a conversation
2. User C (attacker) can call `conversation:join` with their ID
3. User C receives real-time typing indicators, message events, and presence updates
4. Sensitive information leakage (read users typing, future messages)

### Fix Implementation
- Apply same participant verification logic from `message:send` to `conversation:join`
- Query Conversation model and check participant membership before joining room

---

## 2. PUBLIC DOCTOR DUMMY DATA - ROOT CAUSE ANALYSIS

### Issue Locations (Multiple)
1. **Frontend Listing:** [client/src/pages/public/DoctorListingPage.jsx](client/src/pages/public/DoctorListingPage.jsx#L14)
2. **Frontend Profile:** [client/src/pages/public/DoctorProfile.jsx](client/src/pages/public/DoctorProfile.jsx#L4)
3. **Dummy Data:** [client/src/dummyData/DoctorData.js](client/src/dummyData/DoctorData.js#L1) (285 lines of static data)
4. **Booking Dialog:** [client/src/components/appointment/AppointmentDialog.jsx](client/src/components/appointment/AppointmentDialog.jsx#L149)

### Current Architecture (DUMMY)
```javascript
// DoctorListingPage.jsx - Static Array Filtering
const filteredDoctors = DoctorsData.filter((doc) => {
  // Filters against dummy array with hardcoded numeric IDs
  return verifiedMatch && cityMatch && specializationMatch;
});
```

### Backend APIs (READY & WORKING)
**File:** [server/src/routes/doctor.routes.js](server/src/routes/doctor.routes.js#L14-L15)
```javascript
router.get("/public", listDoctors);              // Returns filtered doctors
router.get("/public/:doctorId", getDoctorById);  // Returns single doctor detail
```

**Backend Implementation:** [server/src/controllers/doctor.controller.js](server/src/controllers/doctor.controller.js#L19-L58)
- `listDoctors` - Queries DoctorProfile with filters (city, specialization, verified)
- Returns proper MongoDB IDs via `profile.user._id`
- Supports same filters as frontend (city, specialization, verified)

### Root Cause
1. Frontend was stubbed with dummy data during development
2. Backend APIs exist and are fully functional
3. No API wiring to connect frontend to backend

### Impact
- Public doctor browsing shows demo data, not real doctors
- Booking dialog has numeric IDs instead of MongoDB ObjectIds
- Production credibility issue

### Fix Implementation
1. Remove DoctorsData import from DoctorListingPage.jsx
2. Replace static filtering with TanStack Query fetch from `/doctor/public`
3. Update DoctorProfile.jsx to fetch from `/doctor/public/:doctorId`
4. Remove AppointmentDialog dependency on dummy doc.id property
5. Update appointment booking to use real MongoDB IDs from API response

---

## 3. DOCTOR BOOKING IDS - ROOT CAUSE ANALYSIS

### Issue Locations
1. **Dummy Data:** [client/src/dummyData/DoctorData.js](client/src/dummyData/DoctorData.js#L2) - `id: 1`, `id: 2`, etc. (numeric)
2. **Booking Payload:** [client/src/components/appointment/AppointmentDialog.jsx](client/src/components/appointment/AppointmentDialog.jsx#L149) - `doctorId: doc?.id`

### Current Code (NUMERIC IDS - INCOMPATIBLE)
```javascript
// DoctorData.js
const doctors = [
  { id: 1, fullName: "Dr. Ahmed Raza", ... },
  { id: 2, fullName: "Dr. Sana Malik", ... },
  // ...
];

// AppointmentDialog.jsx
bookingMutation.mutate({
  doctorId: doc?.id,  // ❌ Numeric: 1, 2, 3, etc.
  // ...
});
```

### Backend Expectation (MONGODB IDS)
**File:** [server/src/controllers/appointment.controller.js](server/src/controllers/appointment.controller.js#L34)
```javascript
const doctorUser = await User.findById(doctorId);  // Expects: 507f1f77bcf86cd799439011 or similar
if (!doctorUser || doctorUser.role !== ROLES.DOCTOR) {
  return res.status(404).json({ success: false, message: "Doctor not found" });
}
```

### Root Cause
- Dummy data uses auto-incremented numeric IDs
- MongoDB uses 24-character ObjectId strings
- Finder might accidentally work in dev (numeric coercion) but fails on production MongoDB

### Fix Implementation
- Once dummy data is replaced with real API (task 2), numeric IDs will automatically become MongoDB ObjectIds
- No separate code fix needed if task 2 is properly implemented

---

## 4. PAYMENT ENUM MISMATCH - ROOT CAUSE ANALYSIS

### Issue Locations
1. **Backend Constants:** [server/src/utils/constants.js](server/src/utils/constants.js#L32-L35)
2. **Frontend Conversion:** [client/src/components/appointment/AppointmentDialog.jsx](client/src/components/appointment/AppointmentDialog.jsx#L149)

### Backend Constants (SOURCE OF TRUTH)
```javascript
export const PAYMENT_METHOD = {
  ONLINE: "Pay Online",           // ✅ Full string
  CASH: "Pay at Clinic (Cash)",   // ✅ Full string
};
```

### Backend Validation
**File:** [server/src/controllers/appointment.controller.js](server/src/controllers/appointment.controller.js#L72)
```javascript
paymentMethod: Object.values(PAYMENT_METHOD).includes(paymentMethod)
  ? paymentMethod
  : PAYMENT_METHOD.CASH,
// Expects: "Pay Online" or "Pay at Clinic (Cash)"
```

### Frontend Conversion (WRONG)
**File:** [client/src/components/appointment/AppointmentDialog.jsx](client/src/components/appointment/AppointmentDialog.jsx#L149)
```javascript
bookingMutation.mutate({
  paymentMethod: paymentMethod === "Pay Online" ? "online" : "cash",
  // ❌ Converts to: "online" or "cash"
  // ✅ Should be: "Pay Online" or "Pay at Clinic (Cash)"
});
```

### Root Cause
- Frontend conversion logic doesn't match backend enum values
- Frontend shortens enum values to simplified forms
- Backend validation will silently convert to default CASH if string doesn't match

### How This Manifests
1. User selects "Pay Online"
2. Frontend sends: `paymentMethod: "online"`
3. Backend validation fails match, uses default: `PAYMENT_METHOD.CASH`
4. Appointment saved with CASH method instead of ONLINE
5. Payment processing fails (expected ONLINE but recorded as CASH)

### Fix Implementation
- Update AppointmentDialog.jsx to send full enum strings: "Pay Online" or "Pay at Clinic (Cash)"
- Remove the conversion logic

---

## 5. CHAT ATTACHMENT UPLOAD - ROOT CAUSE ANALYSIS

### Issue Location
**File:** [client/src/services/chat.api.js](client/src/services/chat.api.js#L15-L29)

### Current Code (UNSAFE HEADER)
```javascript
const response = await api.post("/chat/messages", formData, {
  headers: {
    "Content-Type": "multipart/form-data",  // ❌ BREAKS FORM BOUNDARY
  },
});
```

### Root Cause
- When using FormData with browser/axios, the browser generates a boundary string
- Manual Content-Type header `multipart/form-data` lacks the boundary parameter
- Example correct header: `multipart/form-data; boundary=----WebKitFormBoundary7MA4YWxkTrZu0gW`
- Without boundary, multipart parsing fails server-side

### Backend Middleware (CORRECT)
**File:** [server/src/routes/chat.routes.js](server/src/routes/chat.routes.js#L13)
```javascript
router.post("/messages", upload.single("attachment"), sendMessage);
```

**Multer Configuration:** [server/src/middlewares/upload.middleware.js](server/src/middlewares/upload.middleware.js#L1-L15)
```javascript
const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    if (!file.mimetype) {
      return cb(new Error("Invalid file"), false);
    }
    cb(null, true);
  },
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
});
```

### How This Manifests
1. Frontend sends FormData with manual multipart header (missing boundary)
2. Multer can't parse request (no boundary to split fields)
3. req.file is undefined, attachment field lost
4. Message saved without attachment, or parsing error occurs

### Axios Behavior (CORRECT)
```javascript
// ✅ CORRECT - Let Axios + browser handle multipart
const response = await api.post("/chat/messages", formData);
// Browser automatically adds: Content-Type: multipart/form-data; boundary=...
```

### Fix Implementation
- Remove manual `headers: { "Content-Type": "multipart/form-data" }` from chat.api.js
- Let browser/axios handle header generation automatically

---

## DEPENDENCY VERIFICATION

### No Breaking Dependencies Found
- Socket authorization fix is isolated (internal route handler)
- Doctor data fix doesn't affect other components (public API only)
- Payment enum fix is contained to booking logic
- Chat upload fix only affects attachment flow

### Import Chain Safety
- ✅ No circular dependencies detected
- ✅ Model references are properly indexed
- ✅ API clients are abstracted

---

## REGRESSION RISKS IDENTIFIED

### Medium Risk Areas
1. **Socket fix:** May temporarily disconnect active listeners if code deployed live
   - Mitigation: Deploy during low-traffic window or with graceful socket reconnection
   
2. **Doctor data fix:** Public doctor listing will be blank until API responses return
   - Mitigation: Add loading state in UI, provide fallback message

3. **Payment fix:** Existing appointments may have wrong payment method
   - Mitigation: Document that future appointments have correct payment tracking

### Low Risk Areas
- Chat upload and ID fixes have no backward compatibility issues

---

## IMPLEMENTATION ORDER

**Recommended sequence:**
1. **Socket authorization** (safety critical) - 2 min fix
2. **Payment enum mismatch** (prevents booking failures) - 1 min fix
3. **Chat attachment upload** (fixes file handling) - 1 min fix
4. **Doctor public data** (largest change, test thoroughly) - 30-45 min
5. **Booking IDs** (automatic once task 4 complete) - validation only

---

## BUILD & TEST VALIDATION CHECKLIST

- [ ] Build completes without errors: `npm run build` (client + server)
- [ ] TypeScript/ESLint checks pass: `npm run lint`
- [ ] Socket authorization test: Connect as user A, attempt to join user B's conversation
- [ ] Doctor API test: Fetch `/doctor/public` and verify MongoDB IDs in response
- [ ] Appointment booking test: Select payment method "Pay Online", verify backend receives correct enum
- [ ] Chat upload test: Send message with attachment, verify file appears in server upload directory
- [ ] No import errors in browser console on page loads

---

## FILES TO MODIFY

### Phase 1 Modifications
1. [server/src/sockets/socket.handler.js](server/src/sockets/socket.handler.js) - Add participant check
2. [client/src/services/chat.api.js](client/src/services/chat.api.js) - Remove manual header
3. [client/src/components/appointment/AppointmentDialog.jsx](client/src/components/appointment/AppointmentDialog.jsx) - Fix payment enum
4. [client/src/pages/public/DoctorListingPage.jsx](client/src/pages/public/DoctorListingPage.jsx) - Use API instead of dummy data
5. [client/src/pages/public/DoctorProfile.jsx](client/src/pages/public/DoctorProfile.jsx) - Use API instead of dummy data
6. [client/src/services/doctor.api.js](client/src/services/doctor.api.js) - Create/update doctor API client

### New Files to Create
- [client/src/services/doctor.api.js](client/src/services/doctor.api.js) - Doctor API service (if not exists)

---

## READY FOR IMPLEMENTATION

✅ All root causes identified  
✅ All dependencies analyzed  
✅ No breaking changes detected  
✅ Regression risks documented  
✅ Implementation order defined  
✅ Test checklist prepared  
