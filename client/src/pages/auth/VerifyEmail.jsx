import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Loader, Hospital, MailCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMutation } from "@tanstack/react-query";
import { authApi } from "@/services/auth.api";
import toast from "react-hot-toast";

const VerifyEmail = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("Please wait, we are verifying your request");

  const verifyMutation = useMutation({
    mutationFn: authApi.verifyEmail,
    onSuccess: (response) => {
      toast.success(response?.message || "Email verified");
      setMessage("Your email has been verified successfully");
      setLoading(false);

      setTimeout(() => {
        navigate("/auth/login", { replace: true });
      }, 1200);
    },
    onError: (error) => {
      const errorMessage = error?.response?.data?.message || "Verification failed";
      toast.error(errorMessage);
      setMessage(errorMessage);
      setLoading(false);
    },
  });

  useEffect(() => {
    if (!token) {
      setMessage("Verification link sent. Please check your email inbox.");
      setLoading(false);
      return;
    }

    verifyMutation.mutate(token);
  }, [token]);

  useEffect(() => {
    return () => {
      verifyMutation.reset();
    };
  }, [token]);

  return (
    <div className="flex flex-col justify-center items-center h-screen w-screen px-3 lg:p-0 bg-background">
      <div className="my-5 flex items-center justify-center gap-3">
        <h1 className="text-3xl font-bold">CareSync</h1>
        <Hospital className="size-9" />
      </div>

      {loading ? (
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-semibold">
            {message}
          </h1>
          <Loader className="size-8 font-semibold animate-spin" />
        </div>
      ) : (
        <>
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-semibold">
              {message}
            </h1>
            <MailCheck className="size-8 font-semibold text-green-500" />
          </div>
          <Button className="mt-5 rounded-2xl cursor-pointer" onClick={() => navigate("/auth/login")}>
            Go to Login
          </Button>
        </>
      )}
    </div>
  );
};

export default VerifyEmail;
