import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { patientApi } from "@/services/patient.api";
import { authApi } from "@/services/auth.api";
import { setAuthUser } from "@/store/slices/authSlice";
import toast from "react-hot-toast";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const EmergencyContactStep = ({ currentStep }) => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [emergencyName, setEmergencyName] = useState("");
  const [relationship, setRelationship] = useState("Other");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [alternatePhoneNumber, setAlternatePhoneNumber] = useState("");

  const dispatch = useDispatch();
  const isStepValid = Boolean(emergencyName.trim() && phoneNumber.trim());

  const handleSubmit = async () => {
    try {
      setIsLoading(true);

      if (!emergencyName || !phoneNumber) {
        toast.error("Please fill in required fields");
        setIsLoading(false);
        return;
      }

      // Submit onboarding
      await patientApi.submitOnboarding({
        emergencyContact: {
          fullName: emergencyName.trim(),
          relationship: relationship || "Other",
          phone: phoneNumber.trim(),
          alternatePhone: alternatePhoneNumber.trim(),
        },
      });

      // Refresh user state to update isOnboardingCompleted
      const updatedUser = await authApi.getMe();
      dispatch(setAuthUser({
        ...updatedUser.data.user,
        isOnboardingCompleted: true,
      }));

      toast.success("Profile completed successfully!");
      navigate("/dashboard");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to complete onboarding");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrevious = () => {
    navigate(`/patient-onboarding/${currentStep - 1}`);
  };

  return (
    <div className="my-8 space-y-6">
      <h1 className="text-2xl font-bold">Emergency Contact</h1>

      <form className="space-y-5">
        {/* Name */}
        <div className="space-y-2">
          <Label htmlFor="emergencyName">Full Name</Label>
          <Input
            id="emergencyName"
            placeholder="Enter full name"
            className={"rounded-2xl"}
            value={emergencyName}
            onChange={(e) => setEmergencyName(e.target.value)}
          />
        </div>

        {/* Relationship */}
        <div className="space-y-2">
          <Label htmlFor="relationship">Relationship</Label>
          <Select value={relationship} onValueChange={setRelationship}>
            <SelectTrigger className={"rounded-2xl"}>
              <SelectValue placeholder="Select relationship" />
            </SelectTrigger>
            <SelectContent className={"rounded-2xl"}>
              <SelectGroup>
                <SelectLabel>Relationship</SelectLabel>
                <SelectItem value="Father">Father</SelectItem>
                <SelectItem value="Mother">Mother</SelectItem>
                <SelectItem value="Spouse">Spouse</SelectItem>
                <SelectItem value="Sibling">Sibling</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        {/* Phone Number */}
        <div className="space-y-2">
          <Label htmlFor="phoneNumber">Phone Number</Label>
          <Input
            id="phoneNumber"
            placeholder="0330-0000000"
            type="tel"
            className={"rounded-2xl"}
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
          />
        </div>

        {/* Alternate Phone Number */}
        <div className="space-y-2">
          <Label htmlFor="alternatePhoneNumber">Alternate Phone Number</Label>
          <Input
            className={"rounded-2xl"}
            id="alternatePhoneNumber"
            placeholder="0330-0000000"
            type="tel"
            value={alternatePhoneNumber}
            onChange={(e) => setAlternatePhoneNumber(e.target.value)}
          />
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between pt-6">
          <Button
            type="button"
            className={"rounded-2xl"}
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 1}
          >
            Previous
          </Button>

          <Button
            type="button"
            onClick={handleSubmit}
            disabled={!isStepValid || isLoading}
            className={"rounded-2xl"}
          >
            {isLoading ? "Submitting..." : "Submit"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default EmergencyContactStep;
