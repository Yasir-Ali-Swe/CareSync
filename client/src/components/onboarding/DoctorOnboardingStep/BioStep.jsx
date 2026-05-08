import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { doctorApi } from "@/services/doctor.api";
import toast from "react-hot-toast";

import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

const languageOptions = [
  "Urdu",
  "English",
  "Punjabi",
  "Sindhi",
  "Pashto",
  "Balochi",
  "Other",
];

const BioStep = ({ currentStep }) => {
  const navigate = useNavigate();
  const [bio, setBio] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const isStepValid = Boolean(bio.trim());

  const handleNext = async () => {
    try {
      setIsLoading(true);
      if (!isStepValid) {
        toast.error("Please add your bio");
        setIsLoading(false);
        return;
      }

      await doctorApi.submitOnboarding({
        bio: bio.trim(),
        skills,
        languages,
      });

      navigate(`/doctor-onboarding/${currentStep + 1}`);
    } catch (error) {
      toast.error("Failed to save bio details");
    } finally {
      setIsLoading(false);
    }
  };
  const handlePrevious = () =>
    navigate(`/doctor-onboarding/${currentStep - 1}`);

  // UI-only states
  const [skills, setSkills] = useState([]);
  const [languages, setLanguages] = useState([]);

  const toggleLanguage = (lang) => {
    setLanguages((prev) =>
      prev.includes(lang) ? prev.filter((l) => l !== lang) : [...prev, lang],
    );
  };

  const doctorSkills = [
    "Communication",
    "Collaboration",
    "Patient Care",
    "Diagnosis",
    "Surgery",
    "Medical Research",
    "Time Management",
    "Problem Solving",
    "Other",
  ];

  return (
    <div className="my-8 space-y-6">
      <h1 className="text-2xl font-bold">Bio</h1>

      {/* Short Bio */}
      <div className="space-y-2">
        <Label>Short Bio</Label>
        <Textarea placeholder="Write a short bio about yourself..." className={"rounded-2xl"} value={bio} onChange={(e) => setBio(e.target.value)} />
      </div>

      {/* Skills */}
      <div className="space-y-2">
        <Label>Skills</Label>
        <div className="flex flex-wrap gap-3">
          {doctorSkills.map((skill) => {
            const selected = skills.includes(skill);
            return (
              <Button
                key={skill}
                size="sm"
                className={`${
                  selected
                    ? "bg-primary text-primary-foreground hover:bg-primary/90"
                    : "bg-secondary text-primary hover:bg-secondary/90 hover:text-primary"
                } transition-colors duration-200 rounded-2xl`}
                onClick={() =>
                  setSkills((prev) =>
                    prev.includes(skill)
                      ? prev.filter((s) => s !== skill)
                      : [...prev, skill],
                  )
                }
              >
                {skill}
              </Button>
            );
          })}
        </div>
      </div>

      {/* Languages */}
      <div className="space-y-2">
        <Label>Languages</Label>
        <div className="flex flex-wrap gap-3">
          {languageOptions.map((lang) => {
            const selected = languages.includes(lang);
            return (
              <Button
                key={lang}
                size="sm"
                className={`${
                  selected
                    ? "bg-primary text-primary-foreground hover:bg-primary/90"
                    : "bg-secondary text-primary hover:bg-secondary/90 hover:text-primary"
                } transition-colors duration-200 rounded-2xl`}
                onClick={() => toggleLanguage(lang)}
              >
                {lang}
              </Button>
            );
          })}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between pt-6">
        <Button
          type="button"
          variant="outline"
          onClick={handlePrevious}
          disabled={currentStep === 1}
          className={"rounded-2xl"}
        >
          Previous
        </Button>
        <Button type="button" onClick={handleNext} disabled={!isStepValid || isLoading} className={"rounded-2xl"}>
          {isLoading ? "Saving..." : "Next"}
        </Button>
      </div>
    </div>
  );
};

export default BioStep;
