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
import { Textarea } from "@/components/ui/textarea";

const ContactInfoStep = ({ currentStep }) => {
  const navigate = useNavigate();
  const [primaryPhone, setPrimaryPhone] = useState("");
  const [secondaryPhone, setSecondaryPhone] = useState("");
  const [address, setAddress] = useState("");
  const [province, setProvince] = useState("");
  const [city, setCity] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const isStepValid = Boolean(primaryPhone.trim() && address.trim());

  const handleNext = async () => {
    try {
      setIsLoading(true);

      if (!primaryPhone || !address) {
        toast.error("Please fill in all required fields");
        setIsLoading(false);
        return;
      }

      // Save this step's data
      await patientApi.submitOnboarding({
        contactInfo: {
          primaryPhone: primaryPhone.trim(),
          secondaryPhone: secondaryPhone.trim(),
          address: address.trim(),
          province,
          city: city.trim(),
        },
      });

      navigate(`/patient-onboarding/${currentStep + 1}`);
    } catch (error) {
      toast.error("Failed to save contact information");
    } finally {
      setIsLoading(false);
    }
  };
  const handlePrevious = () => {
    navigate(`/patient-onboarding/${currentStep - 1}`);
  };

  return (
    <div className="my-8 space-y-6">
      <h1 className="text-2xl font-bold">Contact Information</h1>

      <form className="space-y-5">
        {/* Primary Phone */}
        <div className="space-y-2">
          <Label htmlFor="phoneNumber">Primary Phone Number</Label>
          <Input
            id="phoneNumber"
            placeholder="0330-0000000"
            type="tel"
            className={"rounded-2xl"}
            value={primaryPhone}
            onChange={(e) => setPrimaryPhone(e.target.value)}
          />
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
            className={"rounded-2xl"}
            value={secondaryPhone}
            onChange={(e) => setSecondaryPhone(e.target.value)}
          />
        </div>

        {/* Address */}
        <div className="space-y-2">
          <Label htmlFor="addressLine">Address</Label>
          <Textarea
            id="addressLine"
            placeholder="Enter your address"
            className={"rounded-2xl"}
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />
        </div>

        {/* Province & City */}
        <div className="flex gap-5">
          <div className="space-y-2">
            <Label>Province</Label>
            <Select value={province} onValueChange={setProvince}>
              <SelectTrigger className={"rounded-2xl"}>
                <SelectValue placeholder="Select Province" />
              </SelectTrigger>
              <SelectContent className={"rounded-2xl"}>
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
            <Input
              id="city"
              placeholder="Enter your city"
              className={"rounded-2xl"}
              value={city}
              onChange={(e) => setCity(e.target.value)}
            />
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between pt-6">
          <Button
            type="button"
            variant="outline"
            className={"rounded-2xl"}
            onClick={handlePrevious}
            disabled={currentStep === 1}
          >
            Previous
          </Button>

          <Button
            type="button"
            onClick={handleNext}
            disabled={!isStepValid || isLoading}
            className={"rounded-2xl"}
          >
            {isLoading ? "Saving..." : "Next"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ContactInfoStep;
