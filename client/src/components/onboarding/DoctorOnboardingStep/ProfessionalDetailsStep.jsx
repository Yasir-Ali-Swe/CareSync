import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

const ProfessionalInfoStep = ({ currentStep }) => {
  const navigate = useNavigate();

  const handleNext = () => navigate(`/doctor-onboarding/${currentStep + 1}`);
  const handlePrevious = () =>
    navigate(`/doctor-onboarding/${currentStep - 1}`);

  const specializations = [
    "Cardiology",
    "Dermatology",
    "General Medicine",
    "Gynecology",
    "Neurology",
    "Pediatrics",
    "Psychiatry",
    "Radiology",
    "Surgery",
    "Orthopedics",
    "ENT",
    "Ophthalmology",
    "Other",
  ];

  const languageOptions = [
    "Urdu",
    "English",
    "Punjabi",
    "Sindhi",
    "Pashto",
    "Balochi",
    "Other",
  ];

  // UI-only state for languages toggle
  const [selectedLanguages, setSelectedLanguages] = useState([]);

  // UI-only state for courses
  const [courses, setCourses] = useState([{ name: "", certificate: null }]);

  const toggleLanguage = (lang) => {
    if (selectedLanguages.includes(lang)) {
      setSelectedLanguages(selectedLanguages.filter((l) => l !== lang));
    } else {
      setSelectedLanguages([...selectedLanguages, lang]);
    }
  };

  const addCourse = () =>
    setCourses([...courses, { name: "", certificate: null }]);
  const handleCourseNameChange = (index, value) => {
    const newCourses = [...courses];
    newCourses[index].name = value;
    setCourses(newCourses);
  };
  const handleCertificateUpload = (index, file) => {
    const newCourses = [...courses];
    newCourses[index].certificate = file;
    setCourses(newCourses);
  };

  return (
    <div className="my-8 space-y-6">
      <h1 className="text-2xl font-bold">Professional Information</h1>

      {/* Core Professional Fields */}
      <div className="space-y-5">
        <div className="space-y-2">
          <Label>Specialization</Label>
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Select Specialization" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Specialization</SelectLabel>
                {specializations.map((spec) => (
                  <SelectItem key={spec} value={spec}>
                    {spec}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Years of Experience</Label>
          <Input
            type="number"
            min={0}
            placeholder="Enter years of experience"
          />
        </div>

        <div className="space-y-2">
          <Label>Consultation Fee (PKR)</Label>
          <Input type="number" min={0} placeholder="Enter consultation fee" />
        </div>
      </div>

      {/* Additional Courses / Workshops */}
      <div className="space-y-3">
        <Label>Additional Courses / Workshops / Diplomas</Label>
        {courses.map((course, index) => (
          <div
            key={index}
            className="flex flex-col md:flex-row md:items-center gap-3"
          >
            <Input
              placeholder="Enter course or diploma"
              value={course.name}
              onChange={(e) => handleCourseNameChange(index, e.target.value)}
            />
            <Input
              type="file"
              onChange={(e) =>
                handleCertificateUpload(index, e.target.files[0])
              }
            />
            {courses.length > 1 && (
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={() =>
                  setCourses(courses.filter((_, i) => i !== index))
                }
              >
                Remove
              </Button>
            )}
          </div>
        ))}
        <Button type="button" variant="outline" onClick={addCourse}>
          + Add Course
        </Button>
      </div>

      {/* Languages Spoken */}
     

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

        <Button type="button" onClick={handleNext} disabled={currentStep === 5}>
          Next
        </Button>
      </div>
    </div>
  );
};

export default ProfessionalInfoStep;
