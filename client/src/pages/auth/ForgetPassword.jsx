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
import { useParams } from "react-router-dom";

const ResetPassword = () => {
  const { token } = useParams();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // For UI only: you can log or handle form submission here
    console.log("Form submitted:", formData, "Token:", token);
  };

  return (
    <div className="flex flex-col justify-center items-center h-screen w-screen px-3 bg-background">
      <div className="my-5 flex items-center gap-3">
        <h1 className="text-3xl font-bold">CareSync</h1>
        <Hospital className="size-9" />
      </div>

      <Card className="w-full max-w-xs md:max-w-sm lg:max-w-md rounded-sm hover:shadow-lg transition-shadow duration-300 shadow-card">
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
              className="w-full my-3 rounded-sm cursor-pointer"
            >
              Reset Password
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
