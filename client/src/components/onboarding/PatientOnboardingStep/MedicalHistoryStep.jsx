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

const MedicalHistoryStep = ({ currentStep }) => {
  const navigate = useNavigate();

  const handleNext = () => {
    navigate(`/patient-onboarding/${currentStep + 1}`);
  };

  const handlePrevious = () => {
    navigate(`/patient-onboarding/${currentStep - 1}`);
  };

  return (
    <div className="my-8 space-y-6">
      <h1 className="text-2xl font-bold">Medical Information</h1>

      <form className="space-y-5">
        {/* Height */}
        <div className="space-y-2">
          <Label htmlFor="height">Height (cm)</Label>
          <Input id="height" type="number" placeholder="Enter your height" />
        </div>

        {/* Weight */}
        <div className="space-y-2">
          <Label htmlFor="weight">Weight (kg)</Label>
          <Input id="weight" type="number" placeholder="Enter your weight" />
        </div>

        {/* Blood Group */}
        <div className="space-y-2">
          <Label htmlFor="bloodGroup">Blood Group</Label>
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Select blood group" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Blood Group</SelectLabel>
                <SelectItem value="A+">A+</SelectItem>
                <SelectItem value="A-">A-</SelectItem>
                <SelectItem value="B+">B+</SelectItem>
                <SelectItem value="B-">B-</SelectItem>
                <SelectItem value="AB+">AB+</SelectItem>
                <SelectItem value="AB-">AB-</SelectItem>
                <SelectItem value="O+">O+</SelectItem>
                <SelectItem value="O-">O-</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="allergies">Allergies (comma separated)</Label>
          <Input id="allergies" placeholder="E.g., Peanuts, Pollen" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="chronicConditions">
            Chronic Conditions (comma separated)
          </Label>
          <Input
            id="chronicConditions"
            placeholder="E.g., Diabetes, Hypertension"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="currentMedications">
            Current Medications (comma separated)
          </Label>
          <Input
            id="currentMedications"
            placeholder="E.g., Metformin, Aspirin"
          />
        </div>

        <div className="flex justify-between pt-6 ">
          <Button
            type="button"
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 1}
          >
            Previous
          </Button>

          <Button
            type="button"
            onClick={handleNext}
            disabled={currentStep === 4}
          >
            Next
          </Button>
        </div>
      </form>
    </div>
  );
};

export default MedicalHistoryStep;
