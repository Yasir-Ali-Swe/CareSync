import React from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { useState } from "react";
import { doctorApi } from "@/services/doctor.api";
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
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [gender, setGender] = useState("other");
  const [isLoading, setIsLoading] = useState(false);
  const isStepValid = Boolean(fullName.trim() && email.trim());

  const handleNext = async () => {
    try {
      setIsLoading(true);
      if (!fullName || !email) {
        toast.error("Please fill in all required fields");
        setIsLoading(false);
        return;
      }

      // Create FormData for multipart submission
      const formData = new FormData();
      formData.append("personalInfo", JSON.stringify({
        fullName: fullName.trim(),
        email: email.trim(),
        birthDate: date || null,
        gender,
      }));
      
      if (imageFile) {
        formData.append("avatar", imageFile);
      }

      await doctorApi.submitOnboarding(formData);

      navigate(`/doctor-onboarding/${currentStep + 1}`);
    } catch (error) {
      toast.error("Failed to save profile data");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrevious = () => {
    navigate(`/doctor-onboarding/${currentStep - 1}`);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
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
            {imagePreview ? (
              <AvatarImage src={imagePreview} />
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
            className={"rounded-2xl"}
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />
        </div>

        {/* Email */}
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            placeholder="Enter your email"
            type="email"
            className={"rounded-2xl"}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        {/* Date of Birth */}
        <div className="space-y-2">
          <Label>Date of Birth</Label>
          <Popover>
            <PopoverTrigger asChild className={"rounded-2xl"}>
              <Button
                variant="outline"
                className="w-full justify-start text-left font-normal"
              >
                {date ? format(date, "PPP") : "Pick a date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 rounded-2xl">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                className={"rounded-2xl"}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Gender & Blood Group */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-2">
            <Label>Gender</Label>
            <Select value={gender} onValueChange={setGender}>
              <SelectTrigger className={"rounded-2xl"}>
                <SelectValue placeholder="Select Gender" />
              </SelectTrigger>
              <SelectContent className={"rounded-2xl"}>
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
            className={"rounded-2xl"}
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

export default PersonalInfoStep;
