import React from "react";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import { getDashboardRouteByRole } from "@/services/auth.api";

const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading, user, role } = useSelector((state) => state.auth);

  if (loading) {
    return null;
  }

  if (isAuthenticated) {
    if (!user?.isOnboardingCompleted && role !== "admin") {
      return <Navigate to="/onboarding" replace />;
    }

    return <Navigate to={getDashboardRouteByRole(role)} replace />;
  }

  return children;
};

export default PublicRoute;
