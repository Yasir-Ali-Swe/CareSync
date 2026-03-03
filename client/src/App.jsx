import React from "react";
import { Route, Routes } from "react-router-dom";
import Login from "@/pages/auth/Login";
import Register from "@/pages/auth/Register";
import SendForgetPasswordRequest from "@/pages/auth/SendForgetPasswordRequest";
import VerifyEmail from "@/pages/auth/VerifyEmail";
import ResetPassword from "@/pages/auth/ForgetPassword";
import PatientOnboarding from "./pages/Patient/patient-onboarding";
import DoctorOnboarding from "./pages/Doctor/doctor-onboarding";
import Home from "./pages/Public/Home";
import Contact from "./pages/Public/Contact";
import PublicLayout from "@/components/layouts/PublicLayout";
import DoctorListingPage from "@/pages/Public/DoctorListingPage";
import ChatLayout from "@/components/layouts/ChatLayout";
import ChatWindowPlaceholder from "@/pages/Chat/ChatWIndowPlacholder";
import ChatWindow from "@/pages/Chat/ChatWindow";
import BookApointment from "@/pages/Public/BookApointment";
import DoctorProfile from "@/pages/Public/DoctorProfile";

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<PublicLayout />}>
        <Route index element={<Home />} />
        <Route path="/contact-us" element={<Contact />} />
        <Route path="/doctors" element={<DoctorListingPage />} />
        <Route
          path="/book-appointment/:doctorId"
          element={<BookApointment />}
        />
        <Route path="/doctor-profile/:doctorId" element={<DoctorProfile />} />
      </Route>
      <Route element={<ChatLayout />}>
        <Route path="/messages" element={<ChatWindowPlaceholder />} />
        <Route path="/messages/:conversationId" element={<ChatWindow />} />
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
