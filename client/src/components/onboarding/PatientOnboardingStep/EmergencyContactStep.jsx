import React from "react";
import { useNavigate } from "react-router-dom";

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

  const handleNext = () => {
    // If this is the last step, maybe submit form or navigate somewhere
    console.log("Form Completed!");
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
            className={"rounded-sm"}
          />
        </div>

        {/* Relationship */}
        <div className="space-y-2">
          <Label htmlFor="relationship">Relationship</Label>
          <Select>
            <SelectTrigger className={"rounded-sm"}>
              <SelectValue placeholder="Select relationship" />
            </SelectTrigger>
            <SelectContent className={"rounded-sm"}>
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
            className={"rounded-sm"}
          />
        </div>

        {/* Alternate Phone Number */}
        <div className="space-y-2">
          <Label htmlFor="alternatePhoneNumber">Alternate Phone Number</Label>
          <Input
            className={"rounded-sm"}
            id="alternatePhoneNumber"
            placeholder="0330-0000000"
            type="tel"
          />
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between pt-6">
          <Button
            type="button"
            className={"rounded-sm"}
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 1}
          >
            Previous
          </Button>

          <Button
            type="button"
            onClick={handleNext}
            disabled={currentStep === 4} // last step, could submit instead
            className={"rounded-sm"}
          >
            Submit
          </Button>
        </div>
      </form>
    </div>
  );
};

export default EmergencyContactStep;
