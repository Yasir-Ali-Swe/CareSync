import { Appointment } from "../models/appointment.model.js";
import { PatientProfile } from "../models/patientProfile.model.js";
import { asyncHandler } from "../middlewares/error.middleware.js";
import { cloudinaryService } from "../services/cloudinary.service.js";

const markOnboardingCompleteIfEligible = (profile) => {
  const ready =
    profile.personalInfo?.fullName &&
    profile.personalInfo?.email &&
    profile.contactInfo?.primaryPhone &&
    profile.contactInfo?.address &&
    profile.medicalInformation?.bloodGroup &&
    profile.emergencyContact?.fullName &&
    profile.emergencyContact?.phone;

  profile.onboardingCompleted = Boolean(ready);
};

export const upsertPatientOnboarding = asyncHandler(async (req, res) => {
  const updates = req.body || {};

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

  profile.set(updates);
  markOnboardingCompleteIfEligible(profile);
  await profile.save();

  return res.status(200).json({
    success: true,
    message: "Patient onboarding/profile updated",
    data: { profile },
  });
});

export const getPatientProfile = asyncHandler(async (req, res) => {
  const profile = await PatientProfile.findOne({ user: req.user._id });

  if (!profile) {
    return res.status(404).json({ success: false, message: "Patient profile not found" });
  }

  return res.status(200).json({ success: true, data: { profile } });
});

export const updatePatientProfile = upsertPatientOnboarding;

export const getPatientAppointments = asyncHandler(async (req, res) => {
  const { status } = req.query;

  const filter = { patient: req.user._id };
  if (status && status !== "all") filter.status = status;

  const appointments = await Appointment.find(filter)
    .populate("doctor", "fullName email")
    .populate("doctorProfile", "specialization")
    .sort({ dateTime: -1 });

  return res.status(200).json({ success: true, data: { appointments } });
});

export const getPatientDashboardStats = asyncHandler(async (req, res) => {
  const patientId = req.user._id;

  const [totalAppointments, upcomingAppointments, pendingAppointments, completedAppointments, cancelledAppointments] =
    await Promise.all([
      Appointment.countDocuments({ patient: patientId }),
      Appointment.countDocuments({ patient: patientId, status: "upcoming" }),
      Appointment.countDocuments({ patient: patientId, status: "pending" }),
      Appointment.countDocuments({ patient: patientId, status: "completed" }),
      Appointment.countDocuments({ patient: patientId, status: "cancelled" }),
    ]);

  const consultedDoctors = await Appointment.distinct("doctor", { patient: patientId, status: "completed" });

  return res.status(200).json({
    success: true,
    data: {
      metrics: {
        totalAppointments,
        upcomingAppointments,
        pendingAppointments,
        completedAppointments,
        cancelledAppointments,
        totalDoctorsConsulted: consultedDoctors.length,
      },
    },
  });
});

export const uploadPatientAvatar = asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: "Avatar image is required" });
  }

  const uploaded = await cloudinaryService.uploadImage(req.file.buffer, "caresync/patient/avatars");

  const profile = await PatientProfile.findOneAndUpdate(
    { user: req.user._id },
    { $set: { "personalInfo.avatarUrl": uploaded.secure_url } },
    { new: true, upsert: true },
  );

  return res.status(200).json({
    success: true,
    message: "Patient avatar uploaded",
    data: {
      avatarUrl: profile.personalInfo.avatarUrl,
    },
  });
});
