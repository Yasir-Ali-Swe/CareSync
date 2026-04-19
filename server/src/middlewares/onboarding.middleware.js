import { DoctorProfile } from "../models/doctorProfile.model.js";
import { PatientProfile } from "../models/patientProfile.model.js";
import { ROLES, USER_STATUS } from "../utils/constants.js";

export const isOnboardingCompletedForUser = async (user) => {
  if (!user) return false;

  if (user.role === ROLES.ADMIN) {
    return true;
  }

  if (user.role === ROLES.PATIENT) {
    const profile = await PatientProfile.findOne({ user: user._id }).select("onboardingCompleted").lean();
    return Boolean(profile?.onboardingCompleted);
  }

  if (user.role === ROLES.DOCTOR) {
    const profile = await DoctorProfile.findOne({ user: user._id }).select("onboardingCompleted").lean();
    return Boolean(profile?.onboardingCompleted);
  }

  return false;
};

export const requireOnboardingCompleted = () => async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    if (!req.user.isEmailVerified) {
      return res.status(403).json({ success: false, message: "Please verify your email first" });
    }

    if (req.user.status !== USER_STATUS.ACTIVE) {
      return res.status(403).json({ success: false, message: "Account is not active" });
    }

    const completed = await isOnboardingCompletedForUser(req.user);
    if (!completed) {
      return res.status(403).json({
        success: false,
        message: "Please complete onboarding first",
        code: "ONBOARDING_REQUIRED",
      });
    }

    return next();
  } catch (error) {
    return next(error);
  }
};
