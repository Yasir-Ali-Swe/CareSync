import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
} from "@/components/ui/select";

const DoctorEducationStep = ({ currentStep }) => {
  const navigate = useNavigate();

  const [educationList, setEducationList] = useState([
    { degree: "", institution: "", startYear: "", endYear: "" },
  ]);

  const handleNext = () => {
    navigate(`/doctor-onboarding/${currentStep + 1}`);
  };

  const handlePrevious = () => {
    navigate(`/doctor-onboarding/${currentStep - 1}`);
  };

  const handleChange = (index, field, value) => {
    const newList = [...educationList];
    newList[index][field] = value;
    setEducationList(newList);
  };

  const addEducation = () => {
    setEducationList([
      ...educationList,
      { degree: "", institution: "", startYear: "", endYear: "" },
    ]);
  };

  const removeEducation = (index) => {
    const newList = educationList.filter((_, i) => i !== index);
    setEducationList(newList);
  };

  const degreeOptions = [
    "MBBS",
    "BDS",
    "MPhil / MS",
    "FCPS Part 1",
    "FCPS Part 2 / Fellowship",
    "MD / MS / PhD",
    "Diploma / Certification",
    "Other",
  ];

  return (
    <div className="my-8 space-y-6">
      <h1 className="text-2xl font-bold">Education Details</h1>

      {educationList.map((edu, index) => (
        <div key={index} className="space-y-4 ">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Degree */}
            <div className="space-y-2">
              <Label>Degree</Label>
              <Select
                value={edu.degree}
                onValueChange={(value) => handleChange(index, "degree", value)}
              >
                <SelectTrigger className={"rounded-2xl"}>
                  <SelectValue placeholder="Select Degree" />
                </SelectTrigger>
                <SelectContent className={"rounded-2xl"}>
                  <SelectGroup>
                    <SelectLabel>Degree</SelectLabel>
                    {degreeOptions.map((deg) => (
                      <SelectItem key={deg} value={deg}>
                        {deg}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            {/* Institution */}
            <div className="space-y-2">
              <Label>Institution</Label>
              <Input
                value={edu.institution}
                placeholder="Enter Institution"
                className={"rounded-2xl"}
                onChange={(e) =>
                  handleChange(index, "institution", e.target.value)
                }
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Start Year */}
            <div className="space-y-2">
              <Label>Start Year</Label>
              <Input
                type="number"
                value={edu.startYear}
                placeholder="YYYY"
                className={"rounded-2xl"}
                onChange={(e) =>
                  handleChange(index, "startYear", e.target.value)
                }
              />
            </div>

            {/* End Year */}
            <div className="space-y-2">
              <Label>End Year</Label>
              <Input
                type="number"
                value={edu.endYear}
                className={"rounded-2xl"}
                placeholder="YYYY"
                onChange={(e) => handleChange(index, "endYear", e.target.value)}
              />
            </div>
          </div>

          {/* Remove button */}
          {educationList.length > 1 && (
            <Button
              type="button"
              variant="destructive"
              className={"rounded-2xl"}
              size="sm"
              onClick={() => removeEducation(index)}
            >
              Remove
            </Button>
          )}
        </div>
      ))}

      {/* Add New Education */}
      <Button
        type="button"
        variant="outline"
        onClick={addEducation}
        className={"rounded-2xl"}
      >
        + Add Another Education
      </Button>

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
          disabled={currentStep === 4}
          className={"rounded-2xl"}
        >
          Next
        </Button>
      </div>
    </div>
  );
};

export default DoctorEducationStep;
