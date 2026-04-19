import mongoose from "mongoose";
import { GENDERS, RELATIONSHIPS } from "../utils/constants.js";

const patientProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },
    personalInfo: {
      avatarUrl: { type: String, default: "" },
      fullName: { type: String, default: "" },
      email: { type: String, default: "" },
      birthDate: { type: Date, default: null },
      gender: { type: String, enum: GENDERS, default: "other" },
    },
    contactInfo: {
      primaryPhone: { type: String, default: "" },
      secondaryPhone: { type: String, default: "" },
      address: { type: String, default: "" },
      province: { type: String, default: "" },
      city: { type: String, default: "" },
    },
    medicalInformation: {
      height: { type: String, default: "" },
      weight: { type: String, default: "" },
      bloodGroup: { type: String, default: "" },
      allergies: [{ type: String, trim: true }],
      chronicConditions: [{ type: String, trim: true }],
    },
    emergencyContact: {
      fullName: { type: String, default: "" },
      relationship: { type: String, enum: RELATIONSHIPS, default: "Other" },
      phone: { type: String, default: "" },
      alternatePhone: { type: String, default: "" },
    },
    onboardingCompleted: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

export const PatientProfile = mongoose.model("PatientProfile", patientProfileSchema);
