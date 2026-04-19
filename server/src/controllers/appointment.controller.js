import { Appointment } from "../models/appointment.model.js";
import { Conversation } from "../models/conversation.model.js";
import { DoctorProfile } from "../models/doctorProfile.model.js";
import { Notification } from "../models/notification.model.js";
import { User } from "../models/user.model.js";
import { asyncHandler } from "../middlewares/error.middleware.js";
import {
  APPOINTMENT_STATUS,
  APPOINTMENT_TYPE,
  PAYMENT_METHOD,
  PAYMENT_STATUS,
  ROLES,
} from "../utils/constants.js";
import { emailService } from "../services/email.service.js";

const getOrCreateConversation = async (userA, userB) => {
  const participants = [String(userA), String(userB)].sort();

  let conversation = await Conversation.findOne({
    participants: { $all: participants, $size: 2 },
  });

  if (!conversation) {
    conversation = await Conversation.create({ participants });
  }

  return conversation;
};

export const bookAppointment = asyncHandler(async (req, res) => {
  const { doctorId, dateTime, appointmentType, paymentMethod, notes } = req.body;

  if (!doctorId || !dateTime || !paymentMethod) {
    return res.status(400).json({
      success: false,
      message: "doctorId, dateTime, and paymentMethod are required",
    });
  }

  const doctorUser = await User.findById(doctorId);
  if (!doctorUser || doctorUser.role !== ROLES.DOCTOR) {
    return res.status(404).json({ success: false, message: "Doctor not found" });
  }

  const doctorProfile = await DoctorProfile.findOne({ user: doctorUser._id });
  if (!doctorProfile) {
    return res.status(404).json({ success: false, message: "Doctor profile not found" });
  }

  const appointmentDate = new Date(dateTime);
  if (Number.isNaN(appointmentDate.getTime())) {
    return res.status(400).json({ success: false, message: "Invalid appointment dateTime" });
  }

  if (appointmentDate.getTime() <= Date.now()) {
    return res.status(400).json({ success: false, message: "Appointment must be in the future" });
  }

  const conversation = await getOrCreateConversation(req.user._id, doctorUser._id);

  const appointment = await Appointment.create({
    patient: req.user._id,
    doctor: doctorUser._id,
    doctorProfile: doctorProfile._id,
    dateTime: appointmentDate,
    appointmentType: Object.values(APPOINTMENT_TYPE).includes(appointmentType)
      ? appointmentType
      : APPOINTMENT_TYPE.IN_PERSON,
    status: APPOINTMENT_STATUS.UPCOMING,
    paymentMethod: Object.values(PAYMENT_METHOD).includes(paymentMethod)
      ? paymentMethod
      : PAYMENT_METHOD.CASH,
    paymentStatus: paymentMethod === PAYMENT_METHOD.ONLINE ? PAYMENT_STATUS.PAID : PAYMENT_STATUS.UNPAID,
    notes: notes || "",
    conversation: conversation._id,
  });

  await Notification.insertMany([
    {
      user: req.user._id,
      actor: doctorUser._id,
      type: "appointment_confirmed",
      title: "Appointment confirmed",
      body: `Your appointment with ${doctorUser.fullName} is confirmed.`,
      entityType: "Appointment",
      entityId: appointment._id,
    },
    {
      user: doctorUser._id,
      actor: req.user._id,
      type: "appointment_confirmed",
      title: "New appointment booked",
      body: `${req.user.fullName} booked an appointment with you.`,
      entityType: "Appointment",
      entityId: appointment._id,
    },
  ]);

  try {
    await emailService.sendAppointmentConfirmationEmail(req.user.email, {
      name: req.user.fullName,
      doctorName: doctorUser.fullName,
      date: appointmentDate.toLocaleDateString(),
      time: appointmentDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    });
  } catch (error) {
    // Non-blocking email failure
  }

  return res.status(201).json({
    success: true,
    message: "Appointment booked successfully",
    data: { appointment },
  });
});

export const listAppointments = asyncHandler(async (req, res) => {
  const { status } = req.query;

  const query = {};

  if (req.user.role === ROLES.PATIENT) query.patient = req.user._id;
  if (req.user.role === ROLES.DOCTOR) query.doctor = req.user._id;

  if (status && status !== "all") query.status = status;

  const appointments = await Appointment.find(query)
    .populate("patient", "fullName email")
    .populate("doctor", "fullName email")
    .populate("doctorProfile", "specialization")
    .sort({ dateTime: -1 });

  return res.status(200).json({ success: true, data: { appointments } });
});

export const cancelAppointment = asyncHandler(async (req, res) => {
  const { appointmentId } = req.params;
  const { reason = "" } = req.body;

  const appointment = await Appointment.findById(appointmentId);
  if (!appointment) {
    return res.status(404).json({ success: false, message: "Appointment not found" });
  }

  if (req.user.role === ROLES.PATIENT && String(appointment.patient) !== String(req.user._id)) {
    return res.status(403).json({ success: false, message: "Forbidden" });
  }

  if (appointment.status !== APPOINTMENT_STATUS.UPCOMING) {
    return res.status(400).json({ success: false, message: "Only upcoming appointments can be cancelled" });
  }

  const minCancellationWindowMs = 24 * 60 * 60 * 1000;
  if (new Date(appointment.dateTime).getTime() - Date.now() < minCancellationWindowMs) {
    return res.status(400).json({
      success: false,
      message: "Appointments can only be cancelled at least 24 hours before schedule",
    });
  }

  appointment.status = APPOINTMENT_STATUS.CANCELLED;
  appointment.cancellationReason = reason;
  appointment.cancelledAt = new Date();
  appointment.paymentStatus = PAYMENT_STATUS.REFUNDED;
  await appointment.save();

  return res.status(200).json({
    success: true,
    message: "Appointment cancelled successfully",
    data: { appointment },
  });
});

export const doctorUpdateAppointmentStatus = asyncHandler(async (req, res) => {
  const { appointmentId } = req.params;
  const { status } = req.body;

  if (![APPOINTMENT_STATUS.COMPLETED, APPOINTMENT_STATUS.CANCELLED].includes(status)) {
    return res.status(400).json({ success: false, message: "Invalid appointment status" });
  }

  const appointment = await Appointment.findById(appointmentId);
  if (!appointment) {
    return res.status(404).json({ success: false, message: "Appointment not found" });
  }

  if (String(appointment.doctor) !== String(req.user._id)) {
    return res.status(403).json({ success: false, message: "Forbidden" });
  }

  appointment.status = status;
  if (status === APPOINTMENT_STATUS.CANCELLED) {
    appointment.cancelledAt = new Date();
  }
  await appointment.save();

  return res.status(200).json({
    success: true,
    message: "Appointment status updated",
    data: { appointment },
  });
});
