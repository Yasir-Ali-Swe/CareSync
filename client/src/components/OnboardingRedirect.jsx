import React from "react";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

const OnboardingRedirect = () => {
  const role = useSelector((state) => state.auth.role);

  if (role === "doctor") {
    return <Navigate to="/doctor-onboarding/1" replace />;
  }

  if (role === "patient") {
    return <Navigate to="/patient-onboarding/1" replace />;
  }

  return <Navigate to="/dashboard" replace />;
};

export default OnboardingRedirect;