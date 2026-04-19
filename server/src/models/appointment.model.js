import mongoose from "mongoose";
import {
  APPOINTMENT_STATUS,
  APPOINTMENT_TYPE,
  PAYMENT_METHOD,
  PAYMENT_STATUS,
} from "../utils/constants.js";

const appointmentSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    doctorProfile: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DoctorProfile",
      required: true,
      index: true,
    },
    dateTime: {
      type: Date,
      required: true,
      index: true,
    },
    appointmentType: {
      type: String,
      enum: Object.values(APPOINTMENT_TYPE),
      default: APPOINTMENT_TYPE.IN_PERSON,
    },
    status: {
      type: String,
      enum: Object.values(APPOINTMENT_STATUS),
      default: APPOINTMENT_STATUS.UPCOMING,
      index: true,
    },
    paymentMethod: {
      type: String,
      enum: Object.values(PAYMENT_METHOD),
      default: PAYMENT_METHOD.CASH,
    },
    paymentStatus: {
      type: String,
      enum: Object.values(PAYMENT_STATUS),
      default: PAYMENT_STATUS.UNPAID,
    },
    notes: {
      type: String,
      default: "",
      trim: true,
    },
    cancellationReason: {
      type: String,
      default: "",
    },
    cancelledAt: {
      type: Date,
      default: null,
    },
    conversation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conversation",
      default: null,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

appointmentSchema.index({ patient: 1, doctor: 1, dateTime: 1 });

export const Appointment = mongoose.model("Appointment", appointmentSchema);
