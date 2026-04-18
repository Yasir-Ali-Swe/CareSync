import React, { useMemo, useState } from "react";
import { format } from "date-fns";
import {
  Check,
  User,
  Phone,
  Stethoscope,
  Ambulance,
  GraduationCap,
} from "lucide-react";
import { FaBriefcase } from "react-icons/fa";
import { MdEventAvailable, MdApartment } from "react-icons/md";
import { BiInfoCircle } from "react-icons/bi";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxItem,
  ComboboxList,
  ComboboxValue,
} from "@/components/ui/combobox";

const provinces = ["Punjab", "Sindh", "KPK", "Balochistan"];
const genderOptions = ["male", "female", "other"];
const bloodGroupOptions = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
const relationshipOptions = ["Father", "Mother", "Spouse", "Sibling", "Other"];
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
const specializationOptions = [
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
const allergies = [
  "Peanuts",
  "Tree Nuts (Almonds, Walnuts, Cashews)",
  "Milk",
  "Eggs",
  "Wheat/Gluten",
  "Soy",
  "Fish",
  "Shellfish",
  "Pollen",
  "Dust Mites",
  "Pet Dander (Cats, Dogs)",
  "Mold",
  "Latex",
  "Insect Stings (Bees, Wasps)",
  "Perfume/Fragrance",
  "Medication (Penicillin, Aspirin, etc.)",
  "Nickel/Metals",
  "Food Additives (Sulfites, MSG)",
  "Other Environmental Allergens",
];
const chronicConditions = [
  "Diabetes",
  "Hypertension",
  "Asthma",
  "COPD",
  "Heart Disease",
  "Chronic Kidney Disease",
  "Arthritis",
  "Osteoporosis",
  "Depression",
  "Anxiety",
  "Cancer",
  "Thyroid Disorders",
  "Stroke",
  "Obesity",
  "Alzheimer's Disease",
  "Parkinson's Disease",
  "Epilepsy",
  "HIV/AIDS",
  "Autoimmune Disorders",
  "Migraine",
  "Other Chronic Conditions",
];
const weekDays = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];
const timezoneOptions = ["Asia/Karachi", "Asia/Dubai", "Asia/Riyadh", "UTC"];

const clone = (value) => JSON.parse(JSON.stringify(value));

const updatePath = (obj, path, value) => {
  const next = clone(obj);
  const keys = Array.isArray(path) ? path : path.split(".");
  let cursor = next;
  for (let i = 0; i < keys.length - 1; i += 1) cursor = cursor[keys[i]];
  cursor[keys[keys.length - 1]] = value;
  return next;
};

const StepFooter = ({
  currentStep,
  totalSteps,
  onPrevious,
  onNext,
  onUpdate,
  loading,
  lastStepLabel = "Next",
}) => (
  <div className="flex justify-between pt-6 gap-3">
    <Button
      type="button"
      variant="outline"
      onClick={onPrevious}
      disabled={currentStep === 1}
      className="rounded-2xl"
    >
      Previous
    </Button>
    <div className="flex items-center gap-3">
      <Button
        type="button"
        onClick={onUpdate}
        disabled={loading}
        className="rounded-2xl"
      >
        {loading ? "Updating..." : "Update"}
      </Button>
      <Button
        type="button"
        onClick={onNext}
        disabled={currentStep === totalSteps}
        className="rounded-2xl"
      >
        {lastStepLabel}
      </Button>
    </div>
  </div>
);

const AlertText = ({ status }) =>
  status ? (
    <p
      className={`text-sm ${status.type === "error" ? "text-destructive" : "text-primary"}`}
    >
      {status.message}
    </p>
  ) : null;

const AvatarPicker = ({ value, onChange }) => {
  const [preview, setPreview] = useState(value || null);
  return (
    <div className="flex flex-col items-center space-y-2">
      <input
        type="file"
        id="avatar-upload"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (!file) return;
          const url = URL.createObjectURL(file);
          setPreview(url);
          onChange(url);
        }}
      />
      <label htmlFor="avatar-upload">
        <Avatar className="w-24 h-24 cursor-pointer border border-border">
          {preview ? (
            <AvatarImage src={preview} />
          ) : (
            <AvatarFallback>
              <User className="w-6 h-6 text-primary" />
            </AvatarFallback>
          )}
        </Avatar>
      </label>
      <p className="text-sm text-muted-foreground">Click to upload</p>
    </div>
  );
};

function PatientPersonalInfoStep({
  profile,
  setProfile,
  currentStep,
  totalSteps,
  onPrevious,
  onNext,
  onUpdate,
  loading,
  status,
}) {
  const [date, setDate] = useState(
    profile.personalInfo.birthDate
      ? new Date(profile.personalInfo.birthDate)
      : null,
  );
  return (
    <div className="my-8 space-y-6">
      <h1 className="text-2xl font-bold">Personal Information</h1>
      <AvatarPicker
        value={profile.personalInfo.avatarUrl}
        onChange={(avatarUrl) =>
          setProfile((p) => updatePath(p, "personalInfo.avatarUrl", avatarUrl))
        }
      />
      <form className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="fullName">Full Name</Label>
          <Input
            id="fullName"
            value={profile.personalInfo.fullName}
            onChange={(e) =>
              setProfile((p) =>
                updatePath(p, "personalInfo.fullName", e.target.value),
              )
            }
            className="rounded-2xl"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={profile.personalInfo.email}
            onChange={(e) =>
              setProfile((p) =>
                updatePath(p, "personalInfo.email", e.target.value),
              )
            }
            className="rounded-2xl"
          />
        </div>
        <div className="space-y-2">
          <Label>Date of Birth</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-start text-left font-normal rounded-2xl"
              >
                {date ? format(date, "PPP") : "Pick a date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={date}
                onSelect={(d) => {
                  setDate(d);
                  setProfile((p) =>
                    updatePath(
                      p,
                      "personalInfo.birthDate",
                      d ? d.toISOString() : "",
                    ),
                  );
                }}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
        <div className="space-y-2">
          <Label>Gender</Label>
          <Select
            value={profile.personalInfo.gender}
            onValueChange={(gender) =>
              setProfile((p) => updatePath(p, "personalInfo.gender", gender))
            }
          >
            <SelectTrigger className="rounded-2xl">
              <SelectValue placeholder="Select Gender" />
            </SelectTrigger>
            <SelectContent className="rounded-2xl">
              <SelectGroup>
                <SelectLabel>Gender</SelectLabel>
                {genderOptions.map((g) => (
                  <SelectItem key={g} value={g}>
                    {g}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        <AlertText status={status} />
        <StepFooter
          currentStep={currentStep}
          totalSteps={totalSteps}
          onPrevious={onPrevious}
          onNext={onNext}
          onUpdate={onUpdate}
          loading={loading}
          lastStepLabel="Next"
        />
      </form>
    </div>
  );
}

function PatientContactInfoStep({
  profile,
  setProfile,
  currentStep,
  totalSteps,
  onPrevious,
  onNext,
  onUpdate,
  loading,
  status,
}) {
  return (
    <div className="my-8 space-y-6">
      <h1 className="text-2xl font-bold">Contact Information</h1>
      <form className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="phoneNumber">Primary Phone Number</Label>
          <Input
            id="phoneNumber"
            value={profile.contactInfo.primaryPhone}
            onChange={(e) =>
              setProfile((p) =>
                updatePath(p, "contactInfo.primaryPhone", e.target.value),
              )
            }
            type="tel"
            className="rounded-2xl"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="secondaryPhoneNumber">
            Secondary Phone Number (Optional)
          </Label>
          <Input
            id="secondaryPhoneNumber"
            value={profile.contactInfo.secondaryPhone}
            onChange={(e) =>
              setProfile((p) =>
                updatePath(p, "contactInfo.secondaryPhone", e.target.value),
              )
            }
            type="tel"
            className="rounded-2xl"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="addressLine">Address</Label>
          <Textarea
            id="addressLine"
            value={profile.contactInfo.address}
            onChange={(e) =>
              setProfile((p) =>
                updatePath(p, "contactInfo.address", e.target.value),
              )
            }
            className="rounded-2xl"
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-2">
            <Label>Province</Label>
            <Select
              value={profile.contactInfo.province}
              onValueChange={(province) =>
                setProfile((p) =>
                  updatePath(p, "contactInfo.province", province),
                )
              }
            >
              <SelectTrigger className="rounded-2xl">
                <SelectValue placeholder="Select Province" />
              </SelectTrigger>
              <SelectContent className="rounded-2xl">
                <SelectGroup>
                  <SelectLabel>Province</SelectLabel>
                  {provinces.map((province) => (
                    <SelectItem key={province} value={province}>
                      {province}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="city">City</Label>
            <Input
              id="city"
              value={profile.contactInfo.city}
              onChange={(e) =>
                setProfile((p) =>
                  updatePath(p, "contactInfo.city", e.target.value),
                )
              }
              className="rounded-2xl"
            />
          </div>
        </div>
        <AlertText status={status} />
        <StepFooter
          currentStep={currentStep}
          totalSteps={totalSteps}
          onPrevious={onPrevious}
          onNext={onNext}
          onUpdate={onUpdate}
          loading={loading}
          lastStepLabel="Next"
        />
      </form>
    </div>
  );
}

function PatientMedicalInfoStep({
  profile,
  setProfile,
  currentStep,
  totalSteps,
  onPrevious,
  onNext,
  onUpdate,
  loading,
  status,
}) {
  const [allergyValue, setAllergyValue] = useState(
    profile.medicalInformation.allergies || [],
  );
  const [conditionValue, setConditionValue] = useState(
    profile.medicalInformation.chronicConditions || [],
  );
  return (
    <div className="my-8 space-y-6">
      <h1 className="text-2xl font-bold">Medical Information</h1>
      <form className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="height">Height (cm)</Label>
          <Input
            id="height"
            type="number"
            value={profile.medicalInformation.height}
            onChange={(e) =>
              setProfile((p) =>
                updatePath(p, "medicalInformation.height", e.target.value),
              )
            }
            className="rounded-2xl"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="weight">Weight (kg)</Label>
          <Input
            id="weight"
            type="number"
            value={profile.medicalInformation.weight}
            onChange={(e) =>
              setProfile((p) =>
                updatePath(p, "medicalInformation.weight", e.target.value),
              )
            }
            className="rounded-2xl"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="bloodGroup">Blood Group</Label>
          <Select
            value={profile.medicalInformation.bloodGroup}
            onValueChange={(bloodGroup) =>
              setProfile((p) =>
                updatePath(p, "medicalInformation.bloodGroup", bloodGroup),
              )
            }
          >
            <SelectTrigger className="rounded-2xl">
              <SelectValue placeholder="Select blood group" />
            </SelectTrigger>
            <SelectContent className="rounded-2xl">
              <SelectGroup>
                <SelectLabel>Blood Group</SelectLabel>
                {bloodGroupOptions.map((bg) => (
                  <SelectItem key={bg} value={bg}>
                    {bg}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="allergies">Allergies</Label>
          <Combobox
            items={allergies}
            multiple
            value={allergyValue}
            onValueChange={(vals) => {
              setAllergyValue(vals);
              setProfile((p) =>
                updatePath(p, "medicalInformation.allergies", vals),
              );
            }}
            className="rounded-2xl w-full"
          >
            <ComboboxChips className="rounded-2xl">
              <ComboboxValue>
                {allergyValue.map((item) => (
                  <ComboboxChip key={item}>{item}</ComboboxChip>
                ))}
              </ComboboxValue>
              <ComboboxChipsInput placeholder="Add Allergies" />
            </ComboboxChips>
            <ComboboxContent
              align="start"
              position="popper"
              className="min-w-full w-full mt-1 rounded-2xl"
            >
              <ComboboxEmpty>No items found.</ComboboxEmpty>
              <ComboboxList>
                {(item) => (
                  <ComboboxItem key={item} value={item}>
                    {item}
                  </ComboboxItem>
                )}
              </ComboboxList>
            </ComboboxContent>
          </Combobox>
        </div>
        <div className="space-y-2 w-full">
          <Label htmlFor="chronicConditions">Chronic Conditions</Label>
          <Combobox
            items={chronicConditions}
            multiple
            value={conditionValue}
            onValueChange={(vals) => {
              setConditionValue(vals);
              setProfile((p) =>
                updatePath(p, "medicalInformation.chronicConditions", vals),
              );
            }}
            className="w-full rounded-2xl"
          >
            <ComboboxChips className="rounded-2xl">
              <ComboboxValue>
                {conditionValue.map((item) => (
                  <ComboboxChip key={item}>{item}</ComboboxChip>
                ))}
              </ComboboxValue>
              <ComboboxChipsInput placeholder="Add Chronic Conditions" />
            </ComboboxChips>
            <ComboboxContent
              align="start"
              position="popper"
              className="min-w-full w-full mt-1 rounded-2xl"
            >
              <ComboboxEmpty>No items found.</ComboboxEmpty>
              <ComboboxList>
                {(item) => (
                  <ComboboxItem key={item} value={item}>
                    {item}
                  </ComboboxItem>
                )}
              </ComboboxList>
            </ComboboxContent>
          </Combobox>
        </div>
        <AlertText status={status} />
        <StepFooter
          currentStep={currentStep}
          totalSteps={totalSteps}
          onPrevious={onPrevious}
          onNext={onNext}
          onUpdate={onUpdate}
          loading={loading}
          lastStepLabel="Next"
        />
      </form>
    </div>
  );
}

function PatientEmergencyContactStep({
  profile,
  setProfile,
  currentStep,
  totalSteps,
  onPrevious,
  onNext,
  onUpdate,
  loading,
  status,
}) {
  return (
    <div className="my-8 space-y-6">
      <h1 className="text-2xl font-bold">Emergency Contact</h1>
      <form className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="emergencyName">Full Name</Label>
          <Input
            id="emergencyName"
            value={profile.emergencyContact.fullName}
            onChange={(e) =>
              setProfile((p) =>
                updatePath(p, "emergencyContact.fullName", e.target.value),
              )
            }
            className="rounded-2xl"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="relationship">Relationship</Label>
          <Select
            value={profile.emergencyContact.relationship}
            onValueChange={(relationship) =>
              setProfile((p) =>
                updatePath(p, "emergencyContact.relationship", relationship),
              )
            }
          >
            <SelectTrigger className="rounded-2xl">
              <SelectValue placeholder="Select relationship" />
            </SelectTrigger>
            <SelectContent className="rounded-2xl">
              <SelectGroup>
                <SelectLabel>Relationship</SelectLabel>
                {relationshipOptions.map((rel) => (
                  <SelectItem key={rel} value={rel}>
                    {rel}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="phoneNumber">Phone Number</Label>
          <Input
            id="phoneNumber"
            value={profile.emergencyContact.phone}
            onChange={(e) =>
              setProfile((p) =>
                updatePath(p, "emergencyContact.phone", e.target.value),
              )
            }
            type="tel"
            className="rounded-2xl"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="alternatePhoneNumber">Alternate Phone Number</Label>
          <Input
            id="alternatePhoneNumber"
            value={profile.emergencyContact.alternatePhone}
            onChange={(e) =>
              setProfile((p) =>
                updatePath(
                  p,
                  "emergencyContact.alternatePhone",
                  e.target.value,
                ),
              )
            }
            type="tel"
            className="rounded-2xl"
          />
        </div>
        <AlertText status={status} />
        <StepFooter
          currentStep={currentStep}
          totalSteps={totalSteps}
          onPrevious={onPrevious}
          onNext={onNext}
          onUpdate={onUpdate}
          loading={loading}
          lastStepLabel="Submit"
        />
      </form>
    </div>
  );
}

function DoctorPersonalInfoStep({
  profile,
  setProfile,
  currentStep,
  totalSteps,
  onPrevious,
  onNext,
  onUpdate,
  loading,
  status,
}) {
  const [date, setDate] = useState(
    profile.personalInfo.birthDate
      ? new Date(profile.personalInfo.birthDate)
      : null,
  );
  return (
    <div className="my-8 space-y-6">
      <h1 className="text-2xl font-bold">Personal Information</h1>
      <AvatarPicker
        value={profile.personalInfo.avatarUrl}
        onChange={(avatarUrl) =>
          setProfile((p) => updatePath(p, "personalInfo.avatarUrl", avatarUrl))
        }
      />
      <form className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="fullName">Full Name</Label>
          <Input
            id="fullName"
            value={profile.personalInfo.fullName}
            onChange={(e) =>
              setProfile((p) =>
                updatePath(p, "personalInfo.fullName", e.target.value),
              )
            }
            className="rounded-2xl"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            value={profile.personalInfo.email}
            onChange={(e) =>
              setProfile((p) =>
                updatePath(p, "personalInfo.email", e.target.value),
              )
            }
            type="email"
            className="rounded-2xl"
          />
        </div>
        <div className="space-y-2">
          <Label>Date of Birth</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-start text-left font-normal rounded-2xl"
              >
                {date ? format(date, "PPP") : "Pick a date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={date}
                onSelect={(d) => {
                  setDate(d);
                  setProfile((p) =>
                    updatePath(
                      p,
                      "personalInfo.birthDate",
                      d ? d.toISOString() : "",
                    ),
                  );
                }}
                className="rounded-2xl"
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
        <div className="space-y-2">
          <Label>Gender</Label>
          <Select
            value={profile.personalInfo.gender}
            onValueChange={(gender) =>
              setProfile((p) => updatePath(p, "personalInfo.gender", gender))
            }
          >
            <SelectTrigger className="rounded-2xl">
              <SelectValue placeholder="Select Gender" />
            </SelectTrigger>
            <SelectContent className="rounded-2xl">
              <SelectGroup>
                <SelectLabel>Gender</SelectLabel>
                {genderOptions.map((g) => (
                  <SelectItem key={g} value={g}>
                    {g}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        <AlertText status={status} />
        <StepFooter
          currentStep={currentStep}
          totalSteps={totalSteps}
          onPrevious={onPrevious}
          onNext={onNext}
          onUpdate={onUpdate}
          loading={loading}
          lastStepLabel="Next"
        />
      </form>
    </div>
  );
}

function DoctorEducationStep({
  profile,
  setProfile,
  currentStep,
  totalSteps,
  onPrevious,
  onNext,
  onUpdate,
  loading,
  status,
}) {
  const educationList = profile.education;
  const setEducationList = (next) =>
    setProfile((p) =>
      updatePath(
        p,
        "education",
        typeof next === "function" ? next(educationList) : next,
      ),
    );
  const handleChange = (index, field, value) => {
    const next = clone(educationList);
    next[index][field] = value;
    setEducationList(next);
  };
  return (
    <div className="my-8 space-y-6">
      <h1 className="text-2xl font-bold">Education Details</h1>
      {educationList.map((edu, index) => (
        <div key={index} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-2">
              <Label>Degree</Label>
              <Select
                value={edu.degree}
                onValueChange={(value) => handleChange(index, "degree", value)}
              >
                <SelectTrigger className="rounded-2xl">
                  <SelectValue placeholder="Select Degree" />
                </SelectTrigger>
                <SelectContent className="rounded-2xl">
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
            <div className="space-y-2">
              <Label>Institution</Label>
              <Input
                value={edu.institution}
                placeholder="Enter Institution"
                className="rounded-2xl"
                onChange={(e) =>
                  handleChange(index, "institution", e.target.value)
                }
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-2">
              <Label>Start Year</Label>
              <Input
                type="number"
                value={edu.startYear}
                placeholder="YYYY"
                className="rounded-2xl"
                onChange={(e) =>
                  handleChange(index, "startYear", e.target.value)
                }
              />
            </div>
            <div className="space-y-2">
              <Label>End Year</Label>
              <Input
                type="number"
                value={edu.endYear}
                placeholder="YYYY"
                className="rounded-2xl"
                onChange={(e) => handleChange(index, "endYear", e.target.value)}
              />
            </div>
          </div>
          {educationList.length > 1 && (
            <Button
              type="button"
              variant="destructive"
              className="rounded-2xl"
              size="sm"
              onClick={() =>
                setEducationList(educationList.filter((_, i) => i !== index))
              }
            >
              Remove
            </Button>
          )}
        </div>
      ))}
      <Button
        type="button"
        variant="outline"
        onClick={() =>
          setEducationList([
            ...educationList,
            { degree: "", institution: "", startYear: "", endYear: "" },
          ])
        }
        className="rounded-2xl"
      >
        + Add Another Education
      </Button>
      <AlertText status={status} />
      <StepFooter
        currentStep={currentStep}
        totalSteps={totalSteps}
        onPrevious={onPrevious}
        onNext={onNext}
        onUpdate={onUpdate}
        loading={loading}
        lastStepLabel="Next"
      />
    </div>
  );
}

function DoctorClinicDetailsStep({
  profile,
  setProfile,
  currentStep,
  totalSteps,
  onPrevious,
  onNext,
  onUpdate,
  loading,
  status,
}) {
  const clinics = profile.clinics;
  const setClinics = (next) =>
    setProfile((p) =>
      updatePath(
        p,
        "clinics",
        typeof next === "function" ? next(clinics) : next,
      ),
    );
  const handleChange = (index, field, value) => {
    const next = clone(clinics);
    if (field.includes(".")) {
      const [parent, child] = field.split(".");
      next[index][parent][child] = value;
    } else next[index][field] = value;
    setClinics(next);
  };
  return (
    <div className="my-8 space-y-6">
      <h1 className="text-2xl font-bold">Work Place Details</h1>
      {clinics.map((clinic, index) => (
        <div key={index} className="space-y-4">
          <div className="space-y-2">
            <Label>Clinic / Hospital Name</Label>
            <Input
              placeholder="Enter clinic or hospital name"
              value={clinic.name}
              className="rounded-2xl"
              onChange={(e) => handleChange(index, "name", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="clinicAddress">Address</Label>
            <Textarea
              id="clinicAddress"
              placeholder="Enter clinic address"
              className="rounded-2xl"
              value={clinic.address.line1}
              onChange={(e) =>
                handleChange(index, "address.line1", e.target.value)
              }
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-2">
              <Label>City</Label>
              <Input
                placeholder="City"
                value={clinic.address.city}
                className="rounded-2xl"
                onChange={(e) =>
                  handleChange(index, "address.city", e.target.value)
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Province</Label>
              <Select
                value={clinic.address.province}
                onValueChange={(value) =>
                  handleChange(index, "address.province", value)
                }
              >
                <SelectTrigger className="rounded-2xl">
                  <SelectValue placeholder="Select Province" />
                </SelectTrigger>
                <SelectContent className="rounded-2xl">
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
                onValueChange={(value) => handleChange(index, "type", value)}
              >
                <SelectTrigger className="rounded-2xl">
                  <SelectValue placeholder="Select Type" />
                </SelectTrigger>
                <SelectContent className="rounded-2xl">
                  <SelectGroup>
                    <SelectLabel>Type</SelectLabel>
                    <SelectItem value="private">Private</SelectItem>
                    <SelectItem value="government">Government</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Contact Number (Optional)</Label>
            <Input
              placeholder="Clinic phone number"
              value={clinic.contactNumber}
              className="rounded-2xl"
              onChange={(e) =>
                handleChange(index, "contactNumber", e.target.value)
              }
            />
          </div>
          {clinics.length > 1 && (
            <Button
              type="button"
              variant="destructive"
              size="sm"
              className="rounded-2xl"
              onClick={() => setClinics(clinics.filter((_, i) => i !== index))}
            >
              Remove Clinic
            </Button>
          )}
        </div>
      ))}
      <Button
        type="button"
        variant="outline"
        onClick={() =>
          setClinics([
            ...clinics,
            {
              name: "",
              address: { line1: "", city: "", province: "", postalCode: "" },
              type: "",
              contactNumber: "",
            },
          ])
        }
        className="rounded-2xl"
      >
        + Add Another Clinic
      </Button>
      <AlertText status={status} />
      <StepFooter
        currentStep={currentStep}
        totalSteps={totalSteps}
        onPrevious={onPrevious}
        onNext={onNext}
        onUpdate={onUpdate}
        loading={loading}
        lastStepLabel="Next"
      />
    </div>
  );
}

function DoctorProfessionalDetailsStep({
  profile,
  setProfile,
  currentStep,
  totalSteps,
  onPrevious,
  onNext,
  onUpdate,
  loading,
  status,
}) {
  const courses = profile.courses;
  const setCourses = (next) =>
    setProfile((p) =>
      updatePath(
        p,
        "courses",
        typeof next === "function" ? next(courses) : next,
      ),
    );
  const handleCourseNameChange = (index, value) => {
    const next = clone(courses);
    next[index].name = value;
    setCourses(next);
  };
  return (
    <div className="my-8 space-y-6">
      <h1 className="text-2xl font-bold">Professional Details</h1>
      <div className="space-y-5">
        <div className="space-y-2">
          <Label>Specialization</Label>
          <Select
            value={profile.specialization}
            onValueChange={(v) =>
              setProfile((p) => updatePath(p, "specialization", v))
            }
          >
            <SelectTrigger className="rounded-2xl">
              <SelectValue placeholder="Select Specialization" />
            </SelectTrigger>
            <SelectContent className="rounded-2xl">
              <SelectGroup>
                <SelectLabel>Specialization</SelectLabel>
                {specializationOptions.map((spec) => (
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
            className="rounded-2xl"
            value={profile.yearsExperience}
            onChange={(e) =>
              setProfile((p) =>
                updatePath(p, "yearsExperience", e.target.value),
              )
            }
            placeholder="Enter years of experience"
          />
        </div>
        <div className="space-y-2">
          <Label>Consultation Fee (PKR)</Label>
          <Input
            type="number"
            min={0}
            placeholder="Enter consultation fee"
            className="rounded-2xl"
            value={profile.consultationFee}
            onChange={(e) =>
              setProfile((p) =>
                updatePath(p, "consultationFee", e.target.value),
              )
            }
          />
        </div>
      </div>
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
              className="rounded-2xl"
              onChange={(e) => handleCourseNameChange(index, e.target.value)}
            />
            <Input
              type="file"
              className="rounded-2xl"
              onChange={(e) => {
                const next = clone(courses);
                next[index].certificate = e.target.files?.[0] || null;
                setCourses(next);
              }}
            />
            {courses.length > 1 && (
              <Button
                type="button"
                variant="destructive"
                className="rounded-2xl"
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
        <Button
          type="button"
          variant="outline"
          onClick={() =>
            setCourses([...courses, { name: "", certificate: null }])
          }
          className="rounded-2xl"
        >
          + Add Course
        </Button>
      </div>
      <AlertText status={status} />
      <StepFooter
        currentStep={currentStep}
        totalSteps={totalSteps}
        onPrevious={onPrevious}
        onNext={onNext}
        onUpdate={onUpdate}
        loading={loading}
        lastStepLabel="Next"
      />
    </div>
  );
}

function DoctorBioStep({
  profile,
  setProfile,
  currentStep,
  totalSteps,
  onPrevious,
  onNext,
  onUpdate,
  loading,
  status,
}) {
  const toggle = (arr, key, field) => {
    const next = arr.includes(field)
      ? arr.filter((x) => x !== field)
      : [...arr, field];
    setProfile((p) => updatePath(p, key, next));
  };
  return (
    <div className="my-8 space-y-6">
      <h1 className="text-2xl font-bold">Bio</h1>
      <div className="space-y-2">
        <Label>Short Bio</Label>
        <Textarea
          value={profile.bio}
          onChange={(e) =>
            setProfile((p) => updatePath(p, "bio", e.target.value))
          }
          placeholder="Write a short bio about yourself..."
          className="rounded-2xl"
        />
      </div>
      <div className="space-y-2">
        <Label>Skills</Label>
        <div className="flex flex-wrap gap-3">
          {doctorSkills.map((skill) => {
            const selected = profile.skills.includes(skill);
            return (
              <Button
                key={skill}
                size="sm"
                type="button"
                className={`${selected ? "bg-primary text-primary-foreground hover:bg-primary/90" : "bg-secondary text-primary hover:bg-secondary/90 hover:text-primary"} transition-colors duration-200 rounded-2xl`}
                onClick={() => toggle(profile.skills, "skills", skill)}
              >
                {skill}
              </Button>
            );
          })}
        </div>
      </div>
      <div className="space-y-2">
        <Label>Languages</Label>
        <div className="flex flex-wrap gap-3">
          {languageOptions.map((lang) => {
            const selected = profile.languages.includes(lang);
            return (
              <Button
                key={lang}
                size="sm"
                type="button"
                className={`${selected ? "bg-primary text-primary-foreground hover:bg-primary/90" : "bg-secondary text-primary hover:bg-secondary/90 hover:text-primary"} transition-colors duration-200 rounded-2xl`}
                onClick={() => toggle(profile.languages, "languages", lang)}
              >
                {lang}
              </Button>
            );
          })}
        </div>
      </div>
      <AlertText status={status} />
      <StepFooter
        currentStep={currentStep}
        totalSteps={totalSteps}
        onPrevious={onPrevious}
        onNext={onNext}
        onUpdate={onUpdate}
        loading={loading}
        lastStepLabel="Next"
      />
    </div>
  );
}

function DoctorAvailabilityStep({
  profile,
  setProfile,
  currentStep,
  totalSteps,
  onPrevious,
  onNext,
  onUpdate,
  loading,
  status,
}) {
  const setSchedule = (next) =>
    setProfile((p) =>
      updatePath(
        p,
        "schedule",
        typeof next === "function" ? next(profile.schedule) : next,
      ),
    );
  const updateSlot = (dayIndex, slotIndex, field, value) => {
    const next = clone(profile.schedule);
    next[dayIndex].slots[slotIndex][field] = value;
    setSchedule(next);
  };
  return (
    <div className="my-8 space-y-6">
      <h1 className="text-2xl font-bold">Set Your Availability</h1>
      <div className="space-y-6">
        {profile.schedule.map((dayItem, dayIndex) => (
          <div key={dayItem.day} className="border p-4 rounded-2xl">
            <h2 className="font-semibold mb-2">{dayItem.day}</h2>
            <div className="space-y-2">
              {dayItem.slots.map((slot, slotIndex) => (
                <div
                  key={`${dayItem.day}-${slotIndex}`}
                  className="flex items-center gap-2 flex-wrap"
                >
                  <div className="flex flex-col">
                    <Label>Start Time</Label>
                    <Input
                      type="time"
                      value={slot.start}
                      className="rounded-2xl"
                      onChange={(e) =>
                        updateSlot(dayIndex, slotIndex, "start", e.target.value)
                      }
                    />
                  </div>
                  <div className="flex flex-col">
                    <Label>End Time</Label>
                    <Input
                      type="time"
                      value={slot.end}
                      className="rounded-2xl"
                      onChange={(e) =>
                        updateSlot(dayIndex, slotIndex, "end", e.target.value)
                      }
                    />
                  </div>
                  {dayItem.slots.length > 1 && (
                    <div className="self-end">
                      <Button
                        type="button"
                        variant="destructive"
                        className="rounded-2xl"
                        size="sm"
                        onClick={() =>
                          setSchedule(
                            profile.schedule.map((d, i) =>
                              i === dayIndex
                                ? {
                                    ...d,
                                    slots: d.slots.filter(
                                      (_, s) => s !== slotIndex,
                                    ),
                                  }
                                : d,
                            ),
                          )
                        }
                      >
                        Remove
                      </Button>
                    </div>
                  )}
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                className="rounded-2xl"
                size="sm"
                onClick={() =>
                  setSchedule(
                    profile.schedule.map((d, i) =>
                      i === dayIndex
                        ? { ...d, slots: [...d.slots, { start: "", end: "" }] }
                        : d,
                    ),
                  )
                }
              >
                + Add Slot
              </Button>
            </div>
          </div>
        ))}
      </div>
      <AlertText status={status} />
      <StepFooter
        currentStep={currentStep}
        totalSteps={totalSteps}
        onPrevious={onPrevious}
        onNext={onNext}
        onUpdate={onUpdate}
        loading={loading}
        lastStepLabel="Next"
      />
    </div>
  );
}

function AdminPersonalInfoStep({
  profile,
  setProfile,
  currentStep,
  totalSteps,
  onPrevious,
  onNext,
  onUpdate,
  loading,
  status,
}) {
  return (
    <div className="my-8 space-y-6">
      <h1 className="text-2xl font-bold">Personal Information</h1>
      <AvatarPicker
        value={profile.personalInfo.avatarUrl}
        onChange={(avatarUrl) =>
          setProfile((p) => updatePath(p, "personalInfo.avatarUrl", avatarUrl))
        }
      />
      <form className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="fullName">Full Name</Label>
          <Input
            id="fullName"
            value={profile.personalInfo.fullName}
            onChange={(e) =>
              setProfile((p) =>
                updatePath(p, "personalInfo.fullName", e.target.value),
              )
            }
            className="rounded-2xl"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={profile.personalInfo.email}
            onChange={(e) =>
              setProfile((p) =>
                updatePath(p, "personalInfo.email", e.target.value),
              )
            }
            className="rounded-2xl"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phoneNumber">Phone Number</Label>
          <Input
            id="phoneNumber"
            value={profile.personalInfo.phone}
            onChange={(e) =>
              setProfile((p) =>
                updatePath(p, "personalInfo.phone", e.target.value),
              )
            }
            className="rounded-2xl"
          />
        </div>
        <AlertText status={status} />
        <StepFooter
          currentStep={currentStep}
          totalSteps={totalSteps}
          onPrevious={onPrevious}
          onNext={onNext}
          onUpdate={onUpdate}
          loading={loading}
          lastStepLabel="Next"
        />
      </form>
    </div>
  );
}

function AdminAccountInfoStep({
  profile,
  setProfile,
  currentStep,
  totalSteps,
  onPrevious,
  onNext,
  onUpdate,
  loading,
  status,
}) {
  return (
    <div className="my-8 space-y-6">
      <h1 className="text-2xl font-bold">Account Information</h1>
      <form className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="username">Username</Label>
          <Input
            id="username"
            value={profile.account.username}
            onChange={(e) =>
              setProfile((p) =>
                updatePath(p, "account.username", e.target.value),
              )
            }
            className="rounded-2xl"
          />
        </div>
        <div className="space-y-2">
          <Label>Timezone</Label>
          <Select
            value={profile.account.timezone}
            onValueChange={(timezone) =>
              setProfile((p) => updatePath(p, "account.timezone", timezone))
            }
          >
            <SelectTrigger className="rounded-2xl">
              <SelectValue placeholder="Select timezone" />
            </SelectTrigger>
            <SelectContent className="rounded-2xl">
              <SelectGroup>
                <SelectLabel>Timezone</SelectLabel>
                {timezoneOptions.map((tz) => (
                  <SelectItem key={tz} value={tz}>
                    {tz}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        <AlertText status={status} />
        <StepFooter
          currentStep={currentStep}
          totalSteps={totalSteps}
          onPrevious={onPrevious}
          onNext={onNext}
          onUpdate={onUpdate}
          loading={loading}
          lastStepLabel="Submit"
        />
      </form>
    </div>
  );
}

const patientInitialProfile = {
  personalInfo: {
    avatarUrl: "",
    fullName: "Ayesha Khan",
    email: "ayesha.khan@example.com",
    birthDate: "1994-08-14",
    gender: "female",
  },
  contactInfo: {
    primaryPhone: "+92 300 1234567",
    secondaryPhone: "+92 321 7654321",
    address: "House 18, Street 4, Gulberg III",
    province: "Punjab",
    city: "Lahore",
  },
  medicalInformation: {
    height: "168",
    weight: "62",
    bloodGroup: "O+",
    allergies: ["Pollen", "Penicillin"],
    chronicConditions: ["Asthma"],
  },
  emergencyContact: {
    fullName: "Sana Khan",
    relationship: "Spouse",
    phone: "+92 300 1112233",
    alternatePhone: "+92 42 5556677",
  },
};

const doctorInitialProfile = {
  personalInfo: {
    avatarUrl: "",
    fullName: "Dr. Hamza Ali",
    email: "hamza.ali@example.com",
    birthDate: "1987-02-21",
    gender: "male",
  },
  education: [
    {
      degree: "MBBS",
      institution: "King Edward Medical University",
      startYear: "2005",
      endYear: "2010",
    },
    {
      degree: "FCPS Part 2 / Fellowship",
      institution: "College of Physicians and Surgeons Pakistan",
      startYear: "2013",
      endYear: "2016",
    },
  ],
  clinics: [
    {
      name: "City Care Hospital",
      address: {
        line1: "27-M, Main Boulevard, DHA Phase 5",
        city: "Lahore",
        province: "Punjab",
        postalCode: "54000",
      },
      type: "private",
      contactNumber: "+92 42 5550199",
    },
  ],
  specialization: "Cardiology",
  yearsExperience: "12",
  consultationFee: "4500",
  courses: [
    { name: "Advanced Cardiac Life Support", certificate: null },
    { name: "Echocardiography Workshop", certificate: null },
  ],
  bio: "Board-certified cardiologist focused on preventive care, long-term heart health, and evidence-based consultation.",
  skills: ["Diagnosis", "Patient Care"],
  languages: ["English", "Urdu"],
  schedule: weekDays.map((day, index) => ({
    day,
    slots:
      index < 5
        ? [
            { start: "09:00", end: "13:00" },
            { start: "17:00", end: "20:00" },
          ]
        : [{ start: "10:00", end: "13:00" }],
  })),
};

const adminInitialProfile = {
  personalInfo: {
    avatarUrl: "",
    fullName: "Nadia Ahmed",
    email: "nadia.ahmed@example.com",
    birthDate: "1990-06-11",
    gender: "female",
  },
  contactInfo: {
    primaryPhone: "+92 300 5558800",
    secondaryPhone: "+92 321 0001122",
    address: "Office 12, Main Boulevard, Johar Town",
    province: "Punjab",
    city: "Lahore",
  },
};

const createConfig = (title, steps, initialProfile) => ({
  title,
  steps,
  initialProfile,
  totalSteps: steps.length,
});

const patientProfileConfig = createConfig(
  "",
  [
    {
      index: 1,
      label: "Personal Information",
      icon: User,
      component: PatientPersonalInfoStep,
      key: "personalInfo",
      validate: (data) =>
        !data.fullName || !data.email
          ? "Please complete personal information."
          : "",
    },
    {
      index: 2,
      label: "Contact Information",
      icon: Phone,
      component: PatientContactInfoStep,
      key: "contactInfo",
      validate: (data) =>
        !data.primaryPhone || !data.address
          ? "Please complete contact information."
          : "",
    },
    {
      index: 3,
      label: "Medical Information",
      icon: Stethoscope,
      component: PatientMedicalInfoStep,
      key: "medicalInformation",
      validate: (data) =>
        !data.height || !data.weight || !data.bloodGroup
          ? "Please complete medical information."
          : "",
    },
    {
      index: 4,
      label: "Emergency Contact",
      icon: Ambulance,
      component: PatientEmergencyContactStep,
      key: "emergencyContact",
      validate: (data) =>
        !data.fullName || !data.phone
          ? "Please complete emergency contact."
          : "",
    },
  ],
  patientInitialProfile,
);

const doctorProfileConfig = createConfig(
  "",
  [
    {
      index: 1,
      label: "Personal Information",
      icon: User,
      component: DoctorPersonalInfoStep,
      key: "personalInfo",
      validate: (data) =>
        !data.fullName || !data.email
          ? "Please complete personal information."
          : "",
    },
    {
      index: 2,
      label: "Education Details",
      icon: GraduationCap,
      component: DoctorEducationStep,
      key: "education",
      validate: (data) => (!data.length ? "Please add education details." : ""),
    },
    {
      index: 3,
      label: "Work Place Details",
      icon: MdApartment,
      component: DoctorClinicDetailsStep,
      key: "clinics",
      validate: (data) => (!data.length ? "Please add workplace details." : ""),
    },
    {
      index: 4,
      label: "Professional Details",
      icon: FaBriefcase,
      component: DoctorProfessionalDetailsStep,
      key: "specialization",
      validate: (data, profile) =>
        !profile.specialization ? "Please complete professional details." : "",
    },
    {
      index: 5,
      label: "Bio",
      icon: BiInfoCircle,
      component: DoctorBioStep,
      key: "bio",
      validate: (data) => (!data ? "Please complete bio." : ""),
    },
    {
      index: 6,
      label: "Set Your Availability",
      icon: MdEventAvailable,
      component: DoctorAvailabilityStep,
      key: "schedule",
      validate: (data) => (!data.length ? "Please add availability." : ""),
    },
  ],
  doctorInitialProfile,
);

const adminProfileConfig = createConfig(
  "",
  [
    {
      index: 1,
      label: "Personal Information",
      icon: User,
      component: PatientPersonalInfoStep,
      key: "personalInfo",
      validate: (data) =>
        !data.fullName || !data.email || !data.birthDate || !data.gender
          ? "Please complete personal information."
          : "",
    },
    {
      index: 2,
      label: "Contact Information",
      icon: Phone,
      component: PatientContactInfoStep,
      key: "contactInfo",
      validate: (data) =>
        !data.primaryPhone || !data.address || !data.province || !data.city
          ? "Please complete contact information."
          : "",
    },
  ],
  adminInitialProfile,
);

export {
  patientProfileConfig,
  doctorProfileConfig,
  adminProfileConfig,
  clone,
  updatePath,
};
