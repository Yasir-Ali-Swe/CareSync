import React from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { useState } from "react";

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

import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Plus } from "lucide-react";

const PersonalInfoStep = ({ currentStep }) => {
  const navigate = useNavigate();
  const [date, setDate] = useState(null);
  const [image, setImage] = useState(null);

  const handleNext = () => {
    navigate(`/patient-onboarding/${currentStep + 1}`);
  };

  const handlePrevious = () => {
    navigate(`/patient-onboarding/${currentStep - 1}`);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(URL.createObjectURL(file));
    }
  };

  return (
    <div className="my-8 space-y-6">
      <h1 className="text-2xl font-bold">Personal Information</h1>

      {/* Avatar Upload */}
      <div className="flex flex-col items-center space-y-2">
        <input
          type="file"
          id="avatar-upload"
          accept="image/*"
          className="hidden"
          onChange={handleImageChange}
        />
        <label htmlFor="avatar-upload">
          <Avatar className="w-24 h-24 cursor-pointer border border-border">
            {image ? (
              <AvatarImage src={image} />
            ) : (
              <AvatarFallback>
                <Plus className="w-6 h-6 text-gray-500" />
              </AvatarFallback>
            )}
          </Avatar>
        </label>
        <p className="text-sm text-muted-foreground">Click to upload</p>
      </div>

      <form className="space-y-5">
        {/* Full Name */}
        <div className="space-y-2">
          <Label htmlFor="fullName">Full Name</Label>
          <Input
            id="fullName"
            placeholder="Enter your full name"
            className={"rounded-sm"}
          />
        </div>

        {/* Email */}
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            placeholder="Enter your email"
            type="email"
            className={"rounded-sm"}
          />
        </div>

        {/* Date of Birth */}
        <div className="space-y-2">
          <Label>Date of Birth</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-start text-left font-normal rounded-sm"
              >
                {date ? format(date, "PPP") : "Pick a date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                className={"rounded-sm"}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Gender & Blood Group */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-2">
            <Label>Gender</Label>
            <Select>
              <SelectTrigger className="rounded-sm">
                <SelectValue placeholder="Select Gender" />
              </SelectTrigger>
              <SelectContent className={"rounded-sm"}>
                <SelectGroup>
                  <SelectLabel>Gender</SelectLabel>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between pt-6">
          <Button
            type="button"
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 1}
            className={"rounded-sm"}
          >
            Previous
          </Button>

          <Button
            type="button"
            onClick={handleNext}
            disabled={currentStep === 4}
            className={"rounded-sm"}
          >
            Next
          </Button>
        </div>
      </form>
    </div>
  );
};

export default PersonalInfoStep;
