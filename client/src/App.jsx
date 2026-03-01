import React from "react";
import { Route, Routes } from "react-router-dom";
import Login from "@/pages/auth/login";
import Register from "@/pages/auth/register";
import SendForgetPasswordRequest from "@/pages/auth/send-forget-password-request";
import VerifyEmail from "@/pages/auth/verify-email";
import ResetPassword from "@/pages/auth/forget-password";
import PatientOnboarding from "./pages/patient/patient-onboarding";
import DoctorOnboarding from "./pages/doctor/doctor-onboarding";
import Home from "./pages/public/home";
import Contact from "./pages/public/contact";
import PublicLayout from "@/components/layouts/PublicLayout";
import DoctorListingPage from "@/pages/public/DoctorListingPage";
import MessagesPgae from "@/pages/public/MessagesPgae";

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<PublicLayout />}>
        <Route index element={<Home />} />
        <Route path="/contact-us" element={<Contact />} />
        <Route path="/doctors" element={<DoctorListingPage />} />
        <Route path="/messages" element={<MessagesPgae />} />
      </Route>
      <Route path="/auth/login" element={<Login />} />
      <Route path="/auth/register" element={<Register />} />
      <Route
        path="/auth/send-forget-password-request"
        element={<SendForgetPasswordRequest />}
      />
      <Route path="/auth/verify-email/:token" element={<VerifyEmail />} />
      <Route path="/auth/reset-password/:token" element={<ResetPassword />} />
      <Route path="/patient-onboarding/:step" element={<PatientOnboarding />} />
      <Route path="/doctor-onboarding/:step" element={<DoctorOnboarding />} />
    </Routes>
  );
};

export default App;
