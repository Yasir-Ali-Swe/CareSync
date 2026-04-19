import React, { useState } from "react";
import {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card.jsx";
import { Input } from "@/components/ui/input.jsx";
import { Label } from "@/components/ui/label.jsx";
import { Mail, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button.jsx";
import { Link, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { authApi, getDashboardRouteByRole } from "@/services/auth.api";
import { useDispatch } from "react-redux";
import { setAuthUser } from "@/store/slices/authSlice";
import toast from "react-hot-toast";

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const loginMutation = useMutation({
    mutationFn: authApi.login,
    onSuccess: async (response) => {
      const accessToken = response?.data?.accessToken;
      const apiUser = response?.data?.user;

      if (accessToken) {
        localStorage.setItem("accessToken", accessToken);
      }

      const isOnboardingCompleted = await authApi.getOnboardingStatus(apiUser.role);

      const user = {
        ...apiUser,
        id: apiUser?.id || apiUser?._id,
        isOnboardingCompleted,
      };

      dispatch(setAuthUser(user));
      toast.success("Login successful");

      if (!isOnboardingCompleted && user.role !== "admin") {
        navigate("/onboarding", { replace: true });
        return;
      }

      navigate(getDashboardRouteByRole(user.role), { replace: true });
    },
    onError: (error) => {
      const message = error?.response?.data?.message || "Unable to login";
      toast.error(message);
    },
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
    loginMutation.mutate(formData);
  };

  return (
    <Card className="w-92.5 lg:w-md rounded-2xl transition-shadow duration-300 shadow-card">
      <CardHeader className="text-lg">
        <CardTitle>Login</CardTitle>
        <CardDescription>
          Please enter your credentials to login.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit}>
          <div className="flex flex-col gap-2 relative">
            <Label htmlFor="email">Email</Label>
            <Input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              className={"rounded-2xl"}
              onChange={handleChange}
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
              className={"rounded-2xl"}
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
          <div className="mt-3">
            <Link
              to="/auth/send-forget-password-request"
              className="text-sm font-semibold text-primary hover:underline underline-offset-4"
            >
              Forgot Password?
            </Link>
          </div>

          <div className="w-full mt-6">
            <Button
              type="submit"
              className="w-full cursor-pointer rounded-2xl"
              disabled={loginMutation.isPending}
            >
              {loginMutation.isPending ? "Logging in..." : "Login"}
            </Button>
          </div>
        </form>
      </CardContent>

      <CardFooter>
        <p className="text-md text-muted-foreground text-center w-full">
          Don't have an account?{" "}
          <Link
            to="/auth/register"
            className="text-primary hover:underline underline-offset-4"
          >
            Register
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
};

export default Login;
