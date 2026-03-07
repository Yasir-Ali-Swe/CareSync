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
import { Textarea } from "@/components/ui/textarea";

const ClinicDetailsStep = ({ currentStep }) => {
  const navigate = useNavigate();

  const [clinics, setClinics] = useState([
    {
      name: "",
      address: { line1: "", city: "", province: "", postalCode: "" },
      type: "",
      contactNumber: "",
    },
  ]);

  const handleNext = () => {
    navigate(`/doctor-onboarding/${currentStep + 1}`);
  };

  const handlePrevious = () => {
    navigate(`/doctor-onboarding/${currentStep - 1}`);
  };

  const handleClinicChange = (index, field, value) => {
    const newClinics = [...clinics];
    if (field.includes(".")) {
      const [parent, child] = field.split(".");
      newClinics[index][parent][child] = value;
    } else {
      newClinics[index][field] = value;
    }
    setClinics(newClinics);
  };

  const addClinic = () => {
    setClinics([
      ...clinics,
      {
        name: "",
        address: {
          line1: "",
          city: "",
          province: "",
        },
        type: "",
        contactNumber: "",
      },
    ]);
  };

  const removeClinic = (index) => {
    const newClinics = clinics.filter((_, i) => i !== index);
    setClinics(newClinics);
  };

  const provinces = ["Punjab", "Sindh", "KPK", "Balochistan", "Other"];
  const clinicTypes = ["private", "government"];

  return (
    <div className="my-8 space-y-6">
      <h1 className="text-2xl font-bold">Work Place Details</h1>

      {clinics.map((clinic, index) => (
        <div key={index} className="space-y-4 ">
          {/* Clinic Name */}
          <div className="space-y-2">
            <Label>Clinic / Hospital Name</Label>
            <Input
              placeholder="Enter clinic or hospital name"
              value={clinic.name}
              className={"rounded-2xl"}
              onChange={(e) =>
                handleClinicChange(index, "name", e.target.value)
              }
            />
          </div>

          {/* Clinic Address */}
          <div className="space-y-2">
            <Label HtmlFor="clinicAddress">Address</Label>
            <Textarea
              id="clinicAddress"
              placeholder="Enter clinic address"
              className={"rounded-2xl"}
              value={clinic.address.line1}
              onChange={(e) =>
                handleClinicChange(index, "address.line1", e.target.value)
              }
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-2">
              <Label>City</Label>
              <Input
                placeholder="City"
                value={clinic.address.city}
                className={"rounded-2xl"}
                onChange={(e) =>
                  handleClinicChange(index, "address.city", e.target.value)
                }
              />
            </div>

            <div className="space-y-2">
              <Label>Province</Label>
              <Select
                value={clinic.address.province}
                onValueChange={(value) =>
                  handleClinicChange(index, "address.province", value)
                }
              >
                <SelectTrigger className={"rounded-2xl"}>
                  <SelectValue placeholder="Select Province" />
                </SelectTrigger>
                <SelectContent className={"rounded-2xl"}>
                  <SelectGroup>
                    <SelectLabel>Province</SelectLabel>
                    {provinces.map((prov) => (
                      <SelectItem key={prov} value={prov}>
                        {prov}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-2">
              <Label>Clinic / Hospital Type</Label>
              <Select
                value={clinic.type}
                onValueChange={(value) =>
                  handleClinicChange(index, "type", value)
                }
              >
                <SelectTrigger className={"rounded-2xl"}>
                  <SelectValue placeholder="Select Type" />
                </SelectTrigger>
                <SelectContent className={"rounded-2xl"}>
                  <SelectGroup>
                    <SelectLabel>Type</SelectLabel>
                    {clinicTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Contact Number */}
          <div className="space-y-2">
            <Label>Contact Number (Optional)</Label>
            <Input
              placeholder="Clinic phone number"
              value={clinic.contactNumber}
              className={"rounded-2xl"}
              onChange={(e) =>
                handleClinicChange(index, "contactNumber", e.target.value)
              }
            />
          </div>

          {/* Remove Clinic */}
          {clinics.length > 1 && (
            <Button
              type="button"
              variant="destructive"
              size="sm"
              className={"rounded-2xl"}
              onClick={() => removeClinic(index)}
            >
              Remove Clinic
            </Button>
          )}
        </div>
      ))}

      {/* Add Another Clinic */}
      <Button type="button" variant="outline" onClick={addClinic} className={"rounded-2xl"}>
        + Add Another Clinic
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

        <Button type="button" onClick={handleNext} disabled={currentStep === 4} className={"rounded-2xl"}>
          Next
        </Button>
      </div>
    </div>
  );
};

export default ClinicDetailsStep;
