import { Appointment } from "../models/appointment.model.js";
import { DoctorProfile } from "../models/doctorProfile.model.js";
import { User } from "../models/user.model.js";
import { asyncHandler } from "../middlewares/error.middleware.js";
import { ROLES, USER_STATUS } from "../utils/constants.js";

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
