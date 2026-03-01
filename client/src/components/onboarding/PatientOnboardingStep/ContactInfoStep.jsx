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
import { Textarea } from "@/components/ui/textarea";

const ContactInfoStep = ({ currentStep }) => {
  const navigate = useNavigate();

  const handleNext = () => {
    navigate(`/patient-onboarding/${currentStep + 1}`);
  };

  const handlePrevious = () => {
    navigate(`/patient-onboarding/${currentStep - 1}`);
  };

  return (
    <div className="mt-8 space-y-6">
      <h1 className="text-2xl font-bold">Contact Information</h1>

      <form className="space-y-5">
        {/* Primary Phone */}
        <div className="space-y-2">
          <Label htmlFor="phoneNumber">Primary Phone Number</Label>
          <Input id="phoneNumber" placeholder="0330-0000000" type="tel" />
        </div>

        {/* Secondary Phone */}
        <div className="space-y-2">
          <Label htmlFor="secondaryPhoneNumber">
            Secondary Phone Number (Optional)
          </Label>
          <Input
            id="secondaryPhoneNumber"
            placeholder="0330-0000000"
            type="tel"
          />
        </div>

        {/* Address */}
        <div className="space-y-2">
          <Label htmlFor="addressLine">Address</Label>
          <Textarea id="addressLine" placeholder="Enter your address" />
        </div>

        {/* Province & City */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-2">
            <Label>Province</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Select Province" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Province</SelectLabel>
                  <SelectItem value="Punjab">Punjab</SelectItem>
                  <SelectItem value="Sindh">Sindh</SelectItem>
                  <SelectItem value="KPK">KPK</SelectItem>
                  <SelectItem value="Balochistan">Balochistan</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="city">City</Label>
            <Input id="city" placeholder="Enter your city" />
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between pt-6">
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

export default ContactInfoStep;
