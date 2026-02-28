import React from "react";
import { Route, Routes } from "react-router-dom";
import Login from "@/pages/auth/login";
import Register from "@/pages/auth/register";
import SendForgetPasswordRequest from "@/pages/auth/send-forget-password-request";
import VerifyEmail from "@/pages/auth/verify-email";

const App = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route
        path="/send-forget-password-request"
        element={<SendForgetPasswordRequest />}
      />
      <Route path="/verify-email/:token" element={<VerifyEmail />} />
    </Routes>
  );
};

export default App;
