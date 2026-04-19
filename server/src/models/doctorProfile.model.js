import mongoose from "mongoose";
import { GENDERS } from "../utils/constants.js";

const slotSchema = new mongoose.Schema(
  {
    start: { type: String, required: true },
    end: { type: String, required: true },
  },
  { _id: false },
);

const scheduleSchema = new mongoose.Schema(
  {
    day: { type: String, required: true },
    slots: { type: [slotSchema], default: [] },
  },
  { _id: false },
);

const doctorProfileSchema = new mongoose.Schema(
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
    education: [
      {
        degree: { type: String, default: "" },
        institution: { type: String, default: "" },
        startYear: { type: String, default: "" },
        endYear: { type: String, default: "" },
      },
    ],
    clinics: [
      {
        name: { type: String, default: "" },
        address: {
          line1: { type: String, default: "" },
          city: { type: String, default: "" },
          province: { type: String, default: "" },
          postalCode: { type: String, default: "" },
        },
        type: {
          type: String,
          enum: ["private", "government", "hospital", "telehealth", ""],
          default: "",
        },
        contactNumber: { type: String, default: "" },
      },
    ],
    specialization: { type: String, default: "" },
    yearsExperience: { type: String, default: "" },
    consultationFee: { type: String, default: "" },
    courses: [
      {
        name: { type: String, default: "" },
        certificateUrl: { type: String, default: "" },
      },
    ],
    bio: { type: String, default: "" },
    skills: [{ type: String, trim: true }],
    languages: [{ type: String, trim: true }],
    schedule: { type: [scheduleSchema], default: [] },
    verified: { type: Boolean, default: false, index: true },
    onboardingCompleted: { type: Boolean, default: false, index: true },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

doctorProfileSchema.index({ specialization: 1 });
doctorProfileSchema.index({ "clinics.address.city": 1 });

export const DoctorProfile = mongoose.model("DoctorProfile", doctorProfileSchema);
