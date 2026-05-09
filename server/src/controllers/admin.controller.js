import { Appointment } from "../models/appointment.model.js";
import { DoctorProfile } from "../models/doctorProfile.model.js";
import { PatientProfile } from "../models/patientProfile.model.js";
import { User } from "../models/user.model.js";
import { asyncHandler } from "../middlewares/error.middleware.js";
import { cloudinaryService } from "../services/cloudinary.service.js";
import { emailService } from "../services/email.service.js";
import { tokenService } from "../services/token.service.js";
import { ROLES, USER_STATUS } from "../utils/constants.js";
import {
  assertRequiredFields,
  isStrongPassword,
  isValidEmail,
} from "../utils/validators.js";
import jwt from "jsonwebtoken";

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
  const page = Number(req.query.page || 1);
  const limit = Number(req.query.limit || 20);

  // Validate pagination params
  if (page < 1 || limit < 1) {
    return res.status(400).json({ success: false, message: "Invalid pagination parameters" });
  }

  const skip = (page - 1) * limit;

  const filter = {};

  if (role !== "all") {
    filter.role = role;
  }

  if (status) {
    filter.status = status;
  }

  // Fetch users and total count in parallel
  const [users, total] = await Promise.all([
    User.find(filter)
      .select("_id fullName email role status createdAt")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    User.countDocuments(filter),
  ]);

  const totalPages = Math.ceil(total / limit);

  return res.status(200).json({
    success: true,
    data: {
      users,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    },
  });
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
        isOnboardingCompleted: Boolean(user.adminProfile?.onboardingCompleted),
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
          isOnboardingCompleted: Boolean(user.adminProfile?.onboardingCompleted),
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

export const createUser = asyncHandler(async (req, res) => {
  const { fullName, email, password, role } = req.body;

  const required = assertRequiredFields(req.body, [
    "fullName",
    "email",
    "password",
    "role",
  ]);
  if (!required.isValid) {
    return res.status(400).json({
      success: false,
      message: `Missing required fields: ${required.missing.join(", ")}`,
    });
  }

  if (!isValidEmail(email)) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid email format" });
  }

  if (!isStrongPassword(password)) {
    return res.status(400).json({
      success: false,
      message:
        "Password must be at least 8 chars and include upper, lower, and number",
    });
  }

  if (!Object.values(ROLES).includes(role)) {
    return res.status(400).json({ success: false, message: "Invalid role" });
  }

  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    return res
      .status(409)
      .json({ success: false, message: "Email already registered" });
  }

  const user = await User.create({
    fullName,
    email: email.toLowerCase(),
    password,
    role,
    status: USER_STATUS.ACTIVE,
  });

  // Initialize role-specific profile and mark email verified for admin-initiated creation
  if (role === ROLES.ADMIN) {
    user.adminProfile = getDefaultAdminProfile();
    // ensure onboarding flag exists and is false
    user.adminProfile.onboardingCompleted = false;
  }

  if (role === ROLES.PATIENT) {
    await PatientProfile.updateOne(
      { user: user._id },
      {
        $setOnInsert: {
          user: user._id,
          personalInfo: { fullName: user.fullName, email: user.email },
        },
      },
      { upsert: true },
    );
  }

  if (role === ROLES.DOCTOR) {
    await DoctorProfile.updateOne(
      { user: user._id },
      {
        $setOnInsert: {
          user: user._id,
          personalInfo: { fullName: user.fullName, email: user.email },
        },
      },
      { upsert: true },
    );
  }

  // Admin-created users are considered email-verified immediately
  user.isEmailVerified = true;

  await user.save();
  // Admin-created users are considered verified and do not receive verification email.

  return res.status(201).json({
    success: true,
    message: "User created successfully",
    data: {
      user: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        status: user.status,
      },
    },
  });
});