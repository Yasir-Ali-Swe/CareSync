import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { useDispatch } from "react-redux";
import { Check, User, Phone } from "lucide-react";
import { adminApi } from "@/services/admin.api";
import { authApi } from "@/services/auth.api";
import { setAuthUser } from "@/store/slices/authSlice";

const AdminOnboarding = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    personalInfo: {
      fullName: "",
      email: "",
      birthDate: "",
      gender: "other",
    },
    contactInfo: {
      primaryPhone: "",
      secondaryPhone: "",
      address: "",
      province: "",
      city: "",
    },
  });

  const updateProfileMutation = useMutation({
    mutationFn: (data) => adminApi.updateProfile(data),
    onSuccess: async () => {
      if (currentStep === 2) {
        try {
          const refreshed = await authApi.getMe();
          if (refreshed?.data?.user) {
            dispatch(
              setAuthUser({
                ...refreshed.data.user,
                id: refreshed.data.user.id || refreshed.data.user._id,
                isOnboardingCompleted: Boolean(refreshed.data.user.isOnboardingCompleted),
              }),
            );
          }
        } catch (error) {
          // Keep the save successful even if auth refresh fails.
        }

        navigate("/admin/dashboard");
      } else {
        setCurrentStep(2);
      }
    },
  });

  const steps = [1, 2];
  const progressPercentage = ((currentStep - 1) / (steps.length - 1)) * 100;

  const handleInputChange = (e, section) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [name]: value,
      },
    }));
  };

  const handleNext = () => {
    const data =
      currentStep === 1 ? formData.personalInfo : formData.contactInfo;
    updateProfileMutation.mutate(data);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <h1 className="text-primary bg-card text-xl font-bold text-center w-full py-5">
        Complete your admin profile to continue
      </h1>

      {/* Step Indicator */}
      <div className="w-full max-w-[90%] md:w-[75%] lg:w-[60%] xl:w-[50%] 2xl:w-[40%] mx-auto px-1 py-4">
        <div className="relative flex justify-between items-center">
          {/* Background Line */}
          <div className="absolute top-1/2 left-0 right-0 h-1 bg-border -translate-y-1/2 z-0" />

          {/* Progress Line */}
          <div
            className="absolute top-1/2 left-0 h-1 bg-primary -translate-y-1/2 z-0 transition-all duration-300"
            style={{ width: `${progressPercentage}%` }}
          />

          {/* Steps */}
          {steps.map((s) => {
            const isCompleted = currentStep > s;
            const isActive = currentStep === s;

            return (
              <div
                key={s}
                className={`w-8 h-8 lg:w-10 lg:h-10 flex items-center justify-center rounded-full border-2 font-semibold z-10 transition-all duration-300
                ${
                  isCompleted
                    ? "bg-primary text-primary-foreground border-primary"
                    : isActive
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-muted text-muted-foreground border-border"
                }`}
              >
                {isCompleted ? (
                  <Check className="w-5 h-5" />
                ) : s === 1 ? (
                  <User
                    className={`w-5 h-5 ${isActive ? "text-background" : "text-primary"}`}
                  />
                ) : (
                  <Phone
                    className={`w-5 h-5 ${isActive ? "text-background" : "text-primary"}`}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Step Content */}
      <div className="flex-1 w-full max-w-[90%] md:w-[75%] lg:w-[60%] xl:w-[50%] 2xl:w-[40%] mx-auto mt-8 space-y-6">
        {currentStep === 1 ? (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">Full Name</label>
              <input
                type="text"
                name="fullName"
                value={formData.personalInfo.fullName}
                onChange={(e) => handleInputChange(e, "personalInfo")}
                className="w-full px-4 py-2 border rounded-lg"
                placeholder="Enter your full name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <input
                type="email"
                name="email"
                value={formData.personalInfo.email}
                onChange={(e) => handleInputChange(e, "personalInfo")}
                className="w-full px-4 py-2 border rounded-lg"
                placeholder="Enter your email"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                Date of Birth
              </label>
              <input
                type="date"
                name="birthDate"
                value={formData.personalInfo.birthDate}
                onChange={(e) => handleInputChange(e, "personalInfo")}
                className="w-full px-4 py-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Gender</label>
              <select
                name="gender"
                value={formData.personalInfo.gender}
                onChange={(e) => handleInputChange(e, "personalInfo")}
                className="w-full px-4 py-2 border rounded-lg"
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">
                Primary Phone
              </label>
              <input
                type="tel"
                name="primaryPhone"
                value={formData.contactInfo.primaryPhone}
                onChange={(e) => handleInputChange(e, "contactInfo")}
                className="w-full px-4 py-2 border rounded-lg"
                placeholder="Enter primary phone number"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                Secondary Phone
              </label>
              <input
                type="tel"
                name="secondaryPhone"
                value={formData.contactInfo.secondaryPhone}
                onChange={(e) => handleInputChange(e, "contactInfo")}
                className="w-full px-4 py-2 border rounded-lg"
                placeholder="Enter secondary phone number (optional)"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Address</label>
              <input
                type="text"
                name="address"
                value={formData.contactInfo.address}
                onChange={(e) => handleInputChange(e, "contactInfo")}
                className="w-full px-4 py-2 border rounded-lg"
                placeholder="Enter your address"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Province
                </label>
                <input
                  type="text"
                  name="province"
                  value={formData.contactInfo.province}
                  onChange={(e) => handleInputChange(e, "contactInfo")}
                  className="w-full px-4 py-2 border rounded-lg"
                  placeholder="Enter province"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">City</label>
                <input
                  type="text"
                  name="city"
                  value={formData.contactInfo.city}
                  onChange={(e) => handleInputChange(e, "contactInfo")}
                  className="w-full px-4 py-2 border rounded-lg"
                  placeholder="Enter city"
                />
              </div>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-8">
          <button
            onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
            disabled={currentStep === 1}
            className="px-6 py-2 border rounded-lg disabled:opacity-50"
          >
            Previous
          </button>
          <button
            onClick={handleNext}
            disabled={updateProfileMutation.isLoading}
            className="px-6 py-2 bg-primary text-primary-foreground rounded-lg disabled:opacity-50"
          >
            {currentStep === steps.length ? "Complete" : "Next"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminOnboarding;
