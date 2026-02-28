import React from "react";
import ImagesGrid from "@/components/common/imagesGrid";
import Register from "@/components/auth/register";
import { Hospital } from "lucide-react";

const RegisterPage = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 h-screen overflow-hidden">
      <div className="w-full hidden lg:flex items-center justify-center bg-primary p-2">
        <ImagesGrid />
      </div>
      <div className="w-full flex flex-col items-center justify-center h-screen bg-secondary">
        <div className="mb-5 flex items-center gap-2">
          <h1 className="text-2xl font-bold text-primary">CareSync</h1>
          <Hospital className="text-primary font-black size-9" />
        </div>
        <Register />
      </div>
    </div>
  );
};

export default RegisterPage;
