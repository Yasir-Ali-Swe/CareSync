import { Appointment } from "../models/appointment.model.js";
import { DoctorProfile } from "../models/doctorProfile.model.js";
import { User } from "../models/user.model.js";
import { asyncHandler } from "../middlewares/error.middleware.js";
import { cloudinaryService } from "../services/cloudinary.service.js";

const markDoctorOnboardingComplete = (profile) => {
  const ready =
    profile.personalInfo?.fullName &&
    profile.personalInfo?.email &&
    Array.isArray(profile.education) &&
    profile.education.length > 0 &&
    Array.isArray(profile.clinics) &&
    profile.clinics.length > 0 &&
    profile.specialization &&
    profile.bio &&
    Array.isArray(profile.schedule) &&
    profile.schedule.length > 0;

  profile.onboardingCompleted = Boolean(ready);
};

export const listDoctors = asyncHandler(async (req, res) => {
  const { city, specialization, verified } = req.query;

  const profileFilter = {};

  if (specialization && specialization !== "All") {
    profileFilter.specialization = specialization;
  }

  if (city && city !== "All") {
    profileFilter["clinics.address.city"] = city;
  }

  if (verified && verified !== "All") {
    profileFilter.verified = verified === "true";
  }

  const profiles = await DoctorProfile.find(profileFilter)
    .populate("user", "fullName email status")
    .sort({ createdAt: -1 });

  const doctors = profiles
    .filter((profile) => profile.user && profile.user.status === "active")
    .map((profile) => ({
      id: profile.user._id,
      doctorProfileId: profile._id,
      fullName: profile.personalInfo?.fullName || profile.user.fullName,
      email: profile.personalInfo?.email || profile.user.email,
      gender: profile.personalInfo?.gender || "other",
      city: profile.clinics?.[0]?.address?.city || "",
      specialization: profile.specialization || "",
      experienceYears: Number(profile.yearsExperience || 0),
      consultationFee: Number(profile.consultationFee || 0),
      verified: Boolean(profile.verified),
      bioShort: profile.bio || "",
      isAvailableToday: Array.isArray(profile.schedule) && profile.schedule.length > 0,
    }));

  return res.status(200).json({ success: true, data: { doctors } });
});

export const getDoctorById = asyncHandler(async (req, res) => {
  const { doctorId } = req.params;

  const profile = await DoctorProfile.findOne({ user: doctorId }).populate("user", "fullName email status");

  if (!profile || !profile.user) {
    return res.status(404).json({ success: false, message: "Doctor not found" });
  }

  return res.status(200).json({
    success: true,
    data: {
      doctor: {
        id: profile.user._id,
        doctorProfileId: profile._id,
        fullName: profile.personalInfo?.fullName || profile.user.fullName,
        email: profile.personalInfo?.email || profile.user.email,
        gender: profile.personalInfo?.gender || "other",
        specialization: profile.specialization,
        experienceYears: Number(profile.yearsExperience || 0),
        consultationFee: Number(profile.consultationFee || 0),
        bioShort: profile.bio,
        verified: profile.verified,
        clinics: profile.clinics,
        schedule: profile.schedule,
        skills: profile.skills,
        languages: profile.languages,
      },
    },
  });
});

export const upsertDoctorOnboarding = asyncHandler(async (req, res) => {
  const updates = req.body || {};

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

  profile.set(updates);
  markDoctorOnboardingComplete(profile);
  await profile.save();

  return res.status(200).json({
    success: true,
    message: "Doctor onboarding/profile updated",
    data: { profile },
  });
});

export const getDoctorProfile = asyncHandler(async (req, res) => {
  const profile = await DoctorProfile.findOne({ user: req.user._id });

  if (!profile) {
    return res.status(404).json({ success: false, message: "Doctor profile not found" });
  }

  return res.status(200).json({ success: true, data: { profile } });
});

export const updateDoctorProfile = upsertDoctorOnboarding;

export const updateDoctorAvailability = asyncHandler(async (req, res) => {
  const { schedule } = req.body;

  if (!Array.isArray(schedule)) {
    return res.status(400).json({ success: false, message: "schedule must be an array" });
  }

  const profile = await DoctorProfile.findOne({ user: req.user._id });
  if (!profile) {
    return res.status(404).json({ success: false, message: "Doctor profile not found" });
  }

  profile.schedule = schedule;
  await profile.save();

  return res.status(200).json({
    success: true,
    message: "Availability updated",
    data: { schedule: profile.schedule },
  });
});

export const getDoctorAppointments = asyncHandler(async (req, res) => {
  const { status, filter } = req.query;
  const query = { doctor: req.user._id };

  if (status && status !== "all") query.status = status;

  let appointments = await Appointment.find(query)
    .populate("patient", "fullName email")
    .sort({ dateTime: -1 });

  if (filter === "today") {
    const now = new Date();
    appointments = appointments.filter((appointment) => {
      const d = new Date(appointment.dateTime);
      return (
        d.getFullYear() === now.getFullYear() &&
        d.getMonth() === now.getMonth() &&
        d.getDate() === now.getDate()
      );
    });
  }

  return res.status(200).json({ success: true, data: { appointments } });
});

export const getDoctorDashboardStats = asyncHandler(async (req, res) => {
  const doctorId = req.user._id;

  const [totalAppointments, completedConsultations, pendingAppointments, cancelledAppointments] =
    await Promise.all([
      Appointment.countDocuments({ doctor: doctorId }),
      Appointment.countDocuments({ doctor: doctorId, status: "completed" }),
      Appointment.countDocuments({ doctor: doctorId, status: { $in: ["upcoming", "pending"] } }),
      Appointment.countDocuments({ doctor: doctorId, status: "cancelled" }),
    ]);

  const totalPatients = (await Appointment.distinct("patient", { doctor: doctorId })).length;

  return res.status(200).json({
    success: true,
    data: {
      metrics: {
        totalPatients,
        totalAppointments,
        completedConsultations,
        pendingAppointments,
        cancelledAppointments,
      },
    },
  });
});

export const uploadDoctorAvatar = asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: "Avatar image is required" });
  }

  const uploaded = await cloudinaryService.uploadImage(req.file.buffer, "caresync/doctor/avatars");

  const profile = await DoctorProfile.findOneAndUpdate(
    { user: req.user._id },
    { $set: { "personalInfo.avatarUrl": uploaded.secure_url } },
    { new: true, upsert: true },
  );

  return res.status(200).json({
    success: true,
    message: "Doctor avatar uploaded",
    data: { avatarUrl: profile.personalInfo.avatarUrl },
  });
});

export const uploadDoctorCertificate = asyncHandler(async (req, res) => {
  const { courseIndex = 0 } = req.body;

  if (!req.file) {
    return res.status(400).json({ success: false, message: "Certificate file is required" });
  }

  const uploaded = await cloudinaryService.uploadFile(req.file.buffer, "caresync/doctor/certificates");

  const profile = await DoctorProfile.findOne({ user: req.user._id });
  if (!profile) {
    return res.status(404).json({ success: false, message: "Doctor profile not found" });
  }

  const parsedIndex = Number(courseIndex);
  if (!profile.courses[parsedIndex]) {
    profile.courses[parsedIndex] = { name: "", certificateUrl: "" };
  }

  profile.courses[parsedIndex].certificateUrl = uploaded.secure_url;
  await profile.save();

  return res.status(200).json({
    success: true,
    message: "Certificate uploaded",
    data: {
      courseIndex: parsedIndex,
      certificateUrl: uploaded.secure_url,
    },
  });
});
