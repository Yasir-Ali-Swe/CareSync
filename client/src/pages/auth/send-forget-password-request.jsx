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
import { Hospital, Mail } from "lucide-react";
import { Link } from "react-router-dom";

const ForgetPasswordRequest = () => {
  const [formData, setFormData] = useState({ email: "" });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
  };

  return (
    <div className="bg-secondary flex flex-col justify-center items-center h-screen w-screen px-3 lg:p-0">
      <div className="my-5 flex items-center justify-center gap-3">
        <h1 className="text-3xl font-bold">CareSync</h1>
        <Hospital className="size-9" />
      </div>
      <Card className="w-full max-w-xs md:max-w-sm lg:max-w-md rounded-sm">
        <CardHeader>
          <CardTitle className="text-xl">Forget Password Request</CardTitle>
          <CardDescription>
            Enter your email to reset your password
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="space-y-1 my-3 relative">
              <Label htmlFor="email" className="text-md">
                Email
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="Enter your email"
                className="rounded-sm"
                value={formData.email}
                onChange={handleChange}
              />
              <div className="absolute right-3 top-9">
                <Label htmlFor="email">
                  <Mail className="size-5 text-primary cursor-pointer" />
                </Label>
              </div>
            </div>
            <div>
              <Link
                to="/login"
                className="text-sm font-semibold text-primary hover:underline"
              >
                Back to Login
              </Link>
            </div>
            <Button
              type="submit"
              className="w-full my-3 rounded-sm cursor-pointer"
            >
              Send Reset Link
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center items-center">
          <h1 className="text-primary font-medium">
            &copy; All rights reserved to CareSync.
          </h1>
        </CardFooter>
      </Card>
    </div>
  );
};

export default ForgetPasswordRequest;
