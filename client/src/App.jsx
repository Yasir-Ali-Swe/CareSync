import React from "react";
import { Route, Routes } from "react-router-dom";
import Login from "@/pages/auth/Login";
import Register from "@/pages/auth/Register";
import SendForgetPasswordRequest from "@/pages/auth/SendForgetPasswordRequest";
import VerifyEmail from "@/pages/auth/VerifyEmail";
import ResetPassword from "@/pages/auth/ForgetPassword";
import PatientOnboarding from "./pages/onboarding/PatientOnboarding";
import DoctorOnboarding from "./pages/onboarding/DoctorOnboarding";
import Home from "./pages/public/Home";
import Contact from "./pages/public/Contact";
import PublicLayout from "@/components/layouts/PublicLayout";
import DoctorListingPage from "@/pages/public/DoctorListingPage";
import ChatLayout from "@/components/layouts/ChatLayout";
import ChatWindowPlaceholder from "@/pages/chat/ChatWIndowPlacholder";
import ChatWindow from "@/pages/chat/ChatWindow";
import DoctorProfile from "@/pages/public/DoctorProfile";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import PatientStats from "@/pages/dashboard/Patient/Stats";
import DashboardIndexRedirect from "@/components/dashboard/DashboardIndexRedirect.jsx";
import DoctorStats from "@/pages/dashboard/Doctor/Stats";
import AdminStats from "@/pages/dashboard/Admin/Stats";
import PatientAppointment from "@/pages/dashboard/Patient/Appointment";
import PatientProfile from "@/pages/dashboard/Patient/Profile";
import DoctorAppointments from "@/pages/dashboard/Doctor/Appointments";
import DoctorDashboardProfile from "@/pages/dashboard/Doctor/Profile";
import AdminUserManagment from "@/pages/dashboard/Admin/UserManagment";
import AdminProfile from "@/pages/dashboard/Admin/Profile";
import ProtectedRoute from "@/components/ProtectedRoute";
import PublicRoute from "@/components/PublicRoute";
import AuthInitializer from "@/components/AuthInitializer";
import OnboardingGuard from "@/components/OnboardingGuard";
import OnboardingRedirect from "@/components/OnboardingRedirect";

const App = () => {
  return (
    <>
      <AuthInitializer />

      <Routes>
        <Route path="/" element={<PublicLayout />}>
          <Route index element={<Home />} />
          <Route path="/contact-us" element={<Contact />} />
          <Route path="/doctors" element={<DoctorListingPage />} />
          <Route path="/doctor-profile/:doctorId" element={<DoctorProfile />} />
        </Route>
        <Route
          element={
            <ProtectedRoute>
              <OnboardingGuard>
                <ChatLayout />
              </OnboardingGuard>
            </ProtectedRoute>
          }
        >
          <Route path="/messages" element={<ChatWindowPlaceholder />} />
          <Route path="/messages/:conversationId" element={<ChatWindow />} />
        </Route>
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <OnboardingGuard>
                <DashboardLayout />
              </OnboardingGuard>
            </ProtectedRoute>
          }
        >
          <Route index element={<DashboardIndexRedirect />} />
          <Route path="patient/stats" element={<PatientStats />} />
          <Route path="doctor/stats" element={<DoctorStats />} />
          <Route path="admin/stats" element={<AdminStats />} />
          <Route path="patient/appointments" element={<PatientAppointment />} />
          <Route path="patient/profile" element={<PatientProfile />} />
          <Route path="doctor/appointments" element={<DoctorAppointments />} />
          <Route path="doctor/profile" element={<DoctorDashboardProfile />} />
          <Route path="admin/users-management" element={<AdminUserManagment />} />
          <Route path="admin/profile" element={<AdminProfile />} />
        </Route>

        <Route
          path="/auth/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />
        <Route
          path="/auth/register"
          element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          }
        />
        <Route
          path="/auth/send-forget-password-request"
          element={
            <PublicRoute>
              <SendForgetPasswordRequest />
            </PublicRoute>
          }
        />
        <Route path="/auth/verify-email" element={<VerifyEmail />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/auth/verify-email/:token" element={<VerifyEmail />} />
        <Route path="/verify-email/:token" element={<VerifyEmail />} />
        <Route path="/auth/reset-password/:token" element={<ResetPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />

        <Route
          path="/onboarding"
          element={
            <ProtectedRoute>
              <OnboardingGuard requireIncomplete>
                <OnboardingRedirect />
              </OnboardingGuard>
            </ProtectedRoute>
          }
        />
        <Route
          path="/patient-onboarding/:step"
          element={
            <ProtectedRoute>
              <OnboardingGuard requireIncomplete>
                <PatientOnboarding />
              </OnboardingGuard>
            </ProtectedRoute>
          }
        />
        <Route
          path="/doctor-onboarding/:step"
          element={
            <ProtectedRoute>
              <OnboardingGuard requireIncomplete>
                <DoctorOnboarding />
              </OnboardingGuard>
            </ProtectedRoute>
          }
        />
      </Routes>
    </>
  );
};

export default App;
