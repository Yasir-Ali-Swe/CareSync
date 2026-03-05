import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Loader, Hospital, MailCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

const VerifyEmail = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      const timer = setTimeout(() => setLoading(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [token]);

  return (
    <div className="flex flex-col justify-center items-center h-screen w-screen px-3 lg:p-0 bg-card">
      <div className="my-5 flex items-center justify-center gap-3">
        <h1 className="text-3xl font-bold">CareSync</h1>
        <Hospital className="size-9" />
      </div>

      {loading ? (
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-semibold">
            Please wait, we are verifying your request
          </h1>
          <Loader className="size-8 font-semibold animate-spin" />
        </div>
      ) : (
        <>
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-semibold">
              Your email has been verified successfully
            </h1>
            <MailCheck className="size-8 font-semibold text-green-500" />
          </div>
          <Button className="mt-5" onClick={() => navigate("/auth/login")}>
            Go to Login
          </Button>
        </>
      )}
    </div>
  );
};

export default VerifyEmail;
