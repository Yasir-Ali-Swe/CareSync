import { Appointment } from "../models/appointment.model.js";
import { DoctorProfile } from "../models/doctorProfile.model.js";
import { User } from "../models/user.model.js";
import { asyncHandler } from "../middlewares/error.middleware.js";
import { cloudinaryService } from "../services/cloudinary.service.js";
import { ROLES, USER_STATUS } from "../utils/constants.js";

const getDefaultAdminProfile = () => ({
  personalInfo: {
    avatarUrl: "",
    fullName: "",
    email: "",
    birthDate: "",
    gender: "other",
  },
  contactInfo: {
    primaryPhone: "",
    secondaryPhone: "",
    address: "",
    province: "",
    city: "",
  },
});

const parseMaybeJson = (value) => {
  if (typeof value !== "string") return value;

  try {
    return JSON.parse(value);
  } catch (error) {
    return value;
  }
};

const buildAdminProfile = (user) => {
  const adminProfile = user.adminProfile || getDefaultAdminProfile();

  return {
    personalInfo: {
      ...getDefaultAdminProfile().personalInfo,
      ...(adminProfile.personalInfo || {}),
      fullName: user.fullName || adminProfile.personalInfo?.fullName || "",
      email: user.email || adminProfile.personalInfo?.email || "",
      avatarUrl: user.profileImageUrl || adminProfile.personalInfo?.avatarUrl || "",
    },
    contactInfo: {
      ...getDefaultAdminProfile().contactInfo,
      ...(adminProfile.contactInfo || {}),
    },
  };
};

export const listUsers = asyncHandler(async (req, res) => {
  const { role = "all", status } = req.query;

  const filter = {};

  if (role !== "all") {
    filter.role = role;
  }

  if (status) {
    filter.status = status;
  }

  const users = await User.find(filter)
    .select("_id fullName email role status createdAt")
    .sort({ createdAt: -1 });

  return res.status(200).json({ success: true, data: { users } });
});

export const updateUserStatus = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { status } = req.body;

  if (!Object.values(USER_STATUS).includes(status)) {
    return res.status(400).json({ success: false, message: "Invalid status" });
  }

  const user = await User.findByIdAndUpdate(userId, { $set: { status } }, { new: true }).select(
    "_id fullName email role status",
  );

  if (!user) {
    return res.status(404).json({ success: false, message: "User not found" });
  }

  return res.status(200).json({
    success: true,
    message: "User status updated",
    data: { user },
  });
});

export const getAdminProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select(
    "_id fullName email role status isEmailVerified profileImageUrl adminProfile",
  );

  if (!user) {
    return res.status(404).json({ success: false, message: "User not found" });
  }

  return res.status(200).json({
    success: true,
    data: {
      profile: buildAdminProfile(user),
      user: {
        ...user.toObject(),
        isOnboardingCompleted: true,
      },
    },
  });
});

export const updateAdminProfile = asyncHandler(async (req, res) => {
  const body = req.body || {};
  const parsedPersonalInfo = parseMaybeJson(body.personalInfo);
  const parsedContactInfo = parseMaybeJson(body.contactInfo);

  const hasDirectPersonalInfo =
    body.fullName || body.email || body.birthDate || body.gender || body.avatarUrl;
  const hasDirectContactInfo =
    body.primaryPhone || body.secondaryPhone || body.address || body.province || body.city;

  const personalInfo = parsedPersonalInfo && typeof parsedPersonalInfo === "object"
    ? parsedPersonalInfo
    : hasDirectPersonalInfo
      ? body
      : null;

  const contactInfo = parsedContactInfo && typeof parsedContactInfo === "object"
    ? parsedContactInfo
    : hasDirectContactInfo
      ? body
      : null;

  if (!personalInfo && !contactInfo && !req.file) {
    return res.status(400).json({ success: false, message: "No profile data provided" });
  }

  const user = await User.findById(req.user._id);
  if (!user) {
    return res.status(404).json({ success: false, message: "User not found" });
  }

  const adminProfile = user.adminProfile || getDefaultAdminProfile();
  let avatarUrl = adminProfile.personalInfo.avatarUrl || user.profileImageUrl || "";

  if (req.file) {
    const uploaded = await cloudinaryService.uploadImage(req.file.buffer, "caresync/admin/avatars");
    avatarUrl = uploaded.secure_url;
  }

  if (personalInfo) {
    adminProfile.personalInfo = {
      ...adminProfile.personalInfo,
      ...personalInfo,
      avatarUrl,
    };

    if (typeof personalInfo.fullName === "string" && personalInfo.fullName.trim()) {
      user.fullName = personalInfo.fullName.trim();
    }

    if (typeof personalInfo.email === "string" && personalInfo.email.trim()) {
      user.email = personalInfo.email.trim().toLowerCase();
    }
  }

  if (contactInfo) {
    adminProfile.contactInfo = {
      ...adminProfile.contactInfo,
      ...contactInfo,
    };
  }

  user.profileImageUrl = avatarUrl;
  user.adminProfile = adminProfile;
  await user.save();

  return res.status(200).json({
    success: true,
    message: "Admin profile updated",
    data: {
      profile: buildAdminProfile(user),
      user: {
        ...user.toObject(),
        isOnboardingCompleted: true,
      },
    },
  });
});

export const getAdminStats = asyncHandler(async (req, res) => {
  const [totalUsers, totalDoctors, totalPatients, activeDoctors, totalAppointments] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ role: ROLES.DOCTOR }),
    User.countDocuments({ role: ROLES.PATIENT }),
    User.countDocuments({ role: ROLES.DOCTOR, status: USER_STATUS.ACTIVE }),
    Appointment.countDocuments(),
  ]);

  const appointmentStatusBreakdown = await Appointment.aggregate([
    { $group: { _id: "$status", value: { $sum: 1 } } },
    { $project: { _id: 0, label: "$_id", value: 1 } },
  ]);

  const specializationDistribution = await DoctorProfile.aggregate([
    {
      $group: {
        _id: {
          $cond: [{ $eq: ["$specialization", ""] }, "Other", "$specialization"],
        },
        value: { $sum: 1 },
      },
    },
    { $project: { _id: 0, label: "$_id", value: 1 } },
  ]);

  return res.status(200).json({
    success: true,
    data: {
      metrics: {
        totalUsers,
        totalDoctors,
        totalPatients,
        totalAppointments,
        activeDoctors,
      },
      appointmentStatusBreakdown,
      specializationDistribution,
    },
  });
});