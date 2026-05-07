import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { patientApi } from "@/services/patient.api";
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

  const handleSubmit = async () => {
    try {
      setIsLoading(true);
      // Collect form data
      const emergencyName = document.getElementById("emergencyName")?.value;
      const relationship = document.querySelector('[role="combobox"]')?.textContent || document.querySelector('[value]')?.value;
      const phoneNumber = document.getElementById("phoneNumber")?.value;
      const alternatePhoneNumber = document.getElementById("alternatePhoneNumber")?.value;

      if (!emergencyName || !phoneNumber) {
        toast.error("Please fill in required fields");
        setIsLoading(false);
        return;
      }

      // Submit onboarding
      await patientApi.submitOnboarding({
        emergencyContact: {
          fullName: emergencyName,
          relationship: relationship || "Other",
          phone: phoneNumber,
          alternatePhone: alternatePhoneNumber,
        },
      });

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
          />
        </div>

        {/* Relationship */}
        <div className="space-y-2">
          <Label htmlFor="relationship">Relationship</Label>
          <Select>
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
            disabled={isLoading}
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
