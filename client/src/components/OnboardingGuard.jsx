import React from "react";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import { getDashboardRouteByRole } from "@/services/auth.api";

const OnboardingGuard = ({ children, requireIncomplete = false }) => {
  const { isAuthenticated, loading, user, role } = useSelector((state) => state.auth);

  if (loading) {
    return null;
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth/login" replace />;
  }

  if (role === "admin") {
    if (requireIncomplete) {
      return <Navigate to={getDashboardRouteByRole(role)} replace />;
    }
    return children;
  }

  const completed = Boolean(user?.isOnboardingCompleted);

  if (!requireIncomplete && !completed) {
    return <Navigate to="/onboarding" replace />;
  }

  if (requireIncomplete && completed) {
    return <Navigate to={getDashboardRouteByRole(role)} replace />;
  }

  return children;
};

export default OnboardingGuard;