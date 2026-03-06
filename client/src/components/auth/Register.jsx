import React, { useState } from "react";
import {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card.jsx";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select.jsx";
import { Input } from "@/components/ui/input.jsx";
import { Label } from "@/components/ui/label.jsx";
import { Mail, Eye, EyeOff, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button.jsx";
import { Link } from "react-router-dom";

const Register = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    role: "patient",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
  };

  return (
    <Card className="w-92.5 lg:w-md rounded-sm hover:shadow-lg transition-shadow duration-300 shadow-card">
      <CardHeader className="text-lg">
        <CardTitle>Register</CardTitle>
        <CardDescription>
          Please enter your credentials to register.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit}>
          <div className="flex flex-col gap-2 relative">
            <Label htmlFor="fullname">Full Name</Label>
            <Input
              type="text"
              id="fullname"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              className={"rounded-sm"}
              placeholder="Please enter your full name"
            />
            <Label htmlFor="fullname" className={"cursor-pointer"}>
              <UserPlus
                className="absolute top-7.5 right-3 text-foreground"
                size={20}
              />
            </Label>
          </div>

          <div className="flex flex-col gap-2 relative mt-3">
            <Label htmlFor="email">Email</Label>
            <Input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={"rounded-sm"}
              placeholder="Please enter your email"
            />
            <Label htmlFor="email" className={"cursor-pointer"}>
              <Mail
                className="absolute top-7.5 right-3 text-foreground"
                size={20}
              />
            </Label>
          </div>

          <div className="flex flex-col gap-2 relative mt-3">
            <Label htmlFor="password">Password</Label>
            <Input
              type={showPassword ? "text" : "password"}
              id="password"
              name="password"
              value={formData.password}
              className={"rounded-sm"}
              onChange={handleChange}
              placeholder="Please enter your password"
            />
            <Label htmlFor="password" className={"cursor-pointer"}>
              {showPassword ? (
                <Eye
                  className="absolute top-7.5 right-3 text-foreground"
                  size={20}
                  onClick={togglePasswordVisibility}
                />
              ) : (
                <EyeOff
                  className="absolute top-7.5 right-3 text-foreground"
                  size={20}
                  onClick={togglePasswordVisibility}
                />
              )}
            </Label>
          </div>

          <div className="flex flex-col gap-2 relative mt-3">
            <Label htmlFor="role">Select Role</Label>
            <Select
              id="role"
              name="role"
              defaultValue="patient"
              onValueChange={(value) =>
                setFormData({ ...formData, role: value })
              }
            >
              <SelectTrigger className="w-33">
                <SelectValue placeholder="Select your role" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Roles</SelectLabel>
                  <SelectItem value="patient">Patient</SelectItem>
                  <SelectItem value="doctor">Doctor</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          <div className="w-full mt-6">
            <Button type="submit" className="w-full cursor-pointer rounded-sm">
              Register
            </Button>
          </div>
        </form>
      </CardContent>

      <CardFooter className="flex flex-col gap-2 justify-center items-center">
        <p className="text-md text-muted-foreground text-center w-full">
          Already have an account?{" "}
          <Link
            to="/auth/login"
            className="text-primary hover:underline underline-offset-4"
          >
            Login
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
};

export default Register;
