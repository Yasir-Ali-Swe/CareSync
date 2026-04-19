import React, { useState } from "react";
import {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Hospital, EyeOff, Eye } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { authApi } from "@/services/auth.api";
import toast from "react-hot-toast";

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });

  const resetMutation = useMutation({
    mutationFn: (payload) => authApi.resetPassword(token, payload),
    onSuccess: (response) => {
      toast.success(response?.message || "Password reset successful");
      navigate("/auth/login", { replace: true });
    },
    onError: (error) => {
      const message = error?.response?.data?.message || "Unable to reset password";
      toast.error(message);
    },
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    resetMutation.mutate({
      password: formData.password,
      confirmPassword: formData.confirmPassword,
    });
  };

  return (
    <div className="flex flex-col justify-center items-center h-screen w-screen px-3 bg-background">
      <div className="my-5 flex items-center gap-3">
        <h1 className="text-3xl font-bold">CareSync</h1>
        <Hospital className="size-9" />
      </div>

      <Card className="w-full max-w-xs md:max-w-sm lg:max-w-md rounded-2xl transition-shadow duration-300 shadow-card">
        <CardHeader>
          <CardTitle className="text-xl">Reset Password</CardTitle>
          <CardDescription>Please enter your new password</CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="space-y-1 mb-3">
              <Label htmlFor="password">New Password</Label>
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                className={"rounded-2xl"}
                value={formData.password}
                onChange={handleChange}
              />
            </div>

            <div className="space-y-1 mb-3">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type={showPassword ? "text" : "password"}
                className={"rounded-2xl"}
                value={formData.confirmPassword}
                onChange={handleChange}
              />
            </div>

            <div
              className="flex items-center gap-2 text-sm text-primary cursor-pointer"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              {showPassword ? "Hide password" : "Show password"}
            </div>

            <Button
              type="submit"
              className="w-full my-3 rounded-2xl cursor-pointer"
              disabled={resetMutation.isPending}
            >
              {resetMutation.isPending ? "Resetting..." : "Reset Password"}
            </Button>
          </form>
        </CardContent>

        <CardFooter className="flex justify-center">
          <p className="text-primary font-medium">
            © All rights reserved to CareSync
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default ResetPassword;
