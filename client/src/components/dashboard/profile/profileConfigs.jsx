import React from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
export {
  patientProfileConfig,
  doctorProfileConfig,
  adminProfileConfig,
  clone,
  updatePath,
} from "@/components/dashboard/profile/profileFlowConfigs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { cn } from "@/lib/utils";
import { Plus, X } from "lucide-react";

const provinces = ["Punjab", "Sindh", "KPK", "Balochistan", "Islamabad", "Other"];
const genderOptions = ["male", "female", "other"];
const bloodGroupOptions = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
const relationshipOptions = ["Father", "Mother", "Spouse", "Sibling", "Child", "Other"];
const clinicTypeOptions = ["private", "government", "hospital", "telehealth"];
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
const languageOptions = ["Urdu", "English", "Punjabi", "Sindhi", "Pashto", "Balochi", "Other"];
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
const patientAllergies = [
  "Peanuts",
  "Tree Nuts",
  "Milk",
  "Eggs",
  "Wheat / Gluten",
  "Soy",
  "Fish",
  "Shellfish",
  "Pollen",
  "Dust Mites",
  "Pet Dander",
  "Mold",
  "Latex",
  "Insect Stings",
  "Perfume / Fragrance",
  "Penicillin",
  "Aspirin",
  "Nickel / Metals",
  "Food Additives",
  "Other",
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
  "Other",
];
const weekDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const timezoneOptions = ["Asia/Karachi", "Asia/Dubai", "Asia/Riyadh", "UTC", "Europe/London"];
const themeOptions = ["system", "light", "dark"];
const notificationOptions = ["email", "sms", "push", "off"];
const roleOptions = ["admin", "super-admin", "support"];
const departmentOptions = ["Operations", "Support", "Clinical Ops", "Finance", "IT", "Compliance"];

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function initials(value) {
  return value
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

function SectionCard({ title, description, children, className }) {
  return (
    <Card className={cn("border-border/70 shadow-none", className)}>
      <CardHeader className="space-y-1 border-b pb-4">
        <CardTitle className="text-base">{title}</CardTitle>
        {description ? <CardDescription>{description}</CardDescription> : null}
      </CardHeader>
      <CardContent className="space-y-5 pt-6">{children}</CardContent>
    </Card>
  );
}

function Field({ label, description, children, className }) {
  return (
    <div className={cn("space-y-2", className)}>
      <div className="space-y-1">
        <Label>{label}</Label>
        {description ? <p className="text-sm text-muted-foreground">{description}</p> : null}
      </div>
      {children}
    </div>
  );
}

function AvatarField({ name, value, onChange }) {
  const inputId = React.useId();

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    onChange(previewUrl);
  };

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
      <Avatar className="size-20 border border-border">
        <AvatarImage src={value || undefined} alt={name} />
        <AvatarFallback className="bg-secondary text-secondary-foreground">
          {initials(name) || <Plus className="size-4" />}
        </AvatarFallback>
      </Avatar>
      <div className="space-y-3">
        <div>
          <p className="text-sm font-medium">Profile photo</p>
          <p className="text-sm text-muted-foreground">
            Upload a JPG or PNG to keep the dashboard profile consistent.
          </p>
        </div>
        <Input id={inputId} type="file" accept="image/*" onChange={handleFileChange} className="cursor-pointer" />
      </div>
    </div>
  );
}

function TagEditor({ label, description, values, onChange, suggestions = [], placeholder = "Type and press Add" }) {
  const [draft, setDraft] = React.useState("");

  const addTag = (tag) => {
    const nextTag = tag.trim();

    if (!nextTag) {
      return;
    }

    const isDuplicate = values.some((item) => item.toLowerCase() === nextTag.toLowerCase());

    if (!isDuplicate) {
      onChange([...values, nextTag]);
    }

    setDraft("");
  };

  const removeTag = (tag) => {
    onChange(values.filter((item) => item !== tag));
  };

  return (
    <div className="space-y-3">
      <Field label={label} description={description}>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Input
            value={draft}
            placeholder={placeholder}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                addTag(draft);
              }
            }}
          />
          <Button type="button" variant="outline" onClick={() => addTag(draft)} className="sm:w-auto">
            Add
          </Button>
        </div>
      </Field>

      <div className="flex flex-wrap gap-2">
        {values.length ? (
          values.map((tag) => (
            <Button key={tag} type="button" variant="secondary" size="sm" onClick={() => removeTag(tag)}>
              {tag}
              <X className="size-3" />
            </Button>
          ))
        ) : (
          <p className="text-sm text-muted-foreground">No items added yet.</p>
        )}
      </div>

      {suggestions.length ? (
        <div className="flex flex-wrap gap-2">
          {suggestions.map((suggestion) => {
            const selected = values.includes(suggestion);

            return (
              <Button
                key={suggestion}
                type="button"
                variant={selected ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  if (!selected) {
                    onChange([...values, suggestion]);
                  }
                }}
                disabled={selected}
              >
                {suggestion}
              </Button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

function defaultPatientData() {
  return {
    personalInfo: {
      avatarUrl: "",
      fullName: "Ayesha Khan",
      email: "ayesha.khan@example.com",
      birthDate: "1994-08-14",
      gender: "female",
    },
    contactDetails: {
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
}

function defaultDoctorData() {
  return {
    personalInfo: {
      avatarUrl: "",
      fullName: "Dr. Hamza Ali",
      email: "hamza.ali@example.com",
      birthDate: "1987-02-21",
      gender: "male",
    },
    educationVerification: {
      educationEntries: [
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
      licenseNumber: "PMC-145789",
      medicalCouncil: "Pakistan Medical and Dental Council",
      verificationStatus: "verified",
      lastVerified: "2025-11-08",
    },
    clinicDetails: {
      clinics: [
        {
          name: "City Care Hospital",
          addressLine: "27-M, Main Boulevard, DHA Phase 5",
          city: "Lahore",
          province: "Punjab",
          postalCode: "54000",
          type: "private",
          contactNumber: "+92 42 5550199",
        },
      ],
    },
    specializationExperience: {
      specialization: "Cardiology",
      yearsExperience: "12",
      consultationFee: "4500",
      courses: [
        { name: "Advanced Cardiac Life Support", certificateName: "acls-certificate.pdf" },
        { name: "Echocardiography Workshop", certificateName: "echo-workshop.pdf" },
      ],
    },
    bioLanguages: {
      bio: "Board-certified cardiologist focused on preventive care, long-term heart health, and evidence-based consultation.",
      skills: ["Diagnosis", "Patient Care"],
      languages: ["English", "Urdu"],
    },
    availability: {
      schedule: weekDays.map((day, index) => ({
        day,
        slots: index < 5 ? [{ start: "09:00", end: "13:00" }, { start: "17:00", end: "20:00" }] : [{ start: "10:00", end: "13:00" }],
      })),
    },
  };
}

function defaultAdminData() {
  return {
    personalInfo: {
      avatarUrl: "",
      fullName: "Nadia Ahmed",
      email: "nadia.ahmed@example.com",
      phone: "+92 300 5558800",
    },
    accountSettings: {
      username: "nadia.admin",
      timezone: "Asia/Karachi",
      language: "English",
      notificationMethod: "email",
      themePreference: "system",
    },
    systemRoleInfo: {
      role: "admin",
      department: "Operations",
      accessScope: "Manage appointments, users, support requests, and dashboard reporting.",
      mfaEnabled: "enabled",
    },
  };
}

function buildPatientProfileConfig() {
  return {
    title: "Patient Profile",
    description: "Profile sections mirror the patient onboarding flow so editable data stays aligned with the backend model.",
    initialData: defaultPatientData(),
    tabs: [
      {
        value: "personalInfo",
        label: "Personal Information",
        description: "Matches onboarding step 1.",
        successMessage: "Patient personal information updated.",
        validate: (values) => {
          const missing = [];

          if (!values.fullName) missing.push("full name");
          if (!values.email) missing.push("email");
          if (!values.birthDate) missing.push("date of birth");
          if (!values.gender) missing.push("gender");

          return missing.length ? `Please complete ${missing.join(", ")}.` : "";
        },
        render: ({ values, setValues }) => (
          <div className="space-y-6">
            <AvatarField
              name={values.fullName}
              value={values.avatarUrl}
              onChange={(avatarUrl) => setValues((prev) => ({ ...prev, avatarUrl }))}
            />

            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Full Name">
                <Input
                  value={values.fullName}
                  onChange={(event) => setValues((prev) => ({ ...prev, fullName: event.target.value }))}
                  placeholder="Enter full name"
                />
              </Field>
              <Field label="Email">
                <Input
                  type="email"
                  value={values.email}
                  onChange={(event) => setValues((prev) => ({ ...prev, email: event.target.value }))}
                  placeholder="Enter email"
                />
              </Field>
              <Field label="Date of Birth">
                <Input
                  type="date"
                  value={values.birthDate}
                  onChange={(event) => setValues((prev) => ({ ...prev, birthDate: event.target.value }))}
                />
              </Field>
              <Field label="Gender">
                <Select value={values.gender} onValueChange={(gender) => setValues((prev) => ({ ...prev, gender }))}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Gender</SelectLabel>
                      {genderOptions.map((option) => (
                        <SelectItem key={option} value={option}>
                          {option.charAt(0).toUpperCase() + option.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </Field>
            </div>
          </div>
        ),
      },
      {
        value: "contactDetails",
        label: "Contact Information",
        description: "Matches onboarding step 2.",
        successMessage: "Patient contact details updated.",
        validate: (values) => {
          const missing = [];

          if (!values.primaryPhone) missing.push("primary phone");
          if (!values.address) missing.push("address");
          if (!values.province) missing.push("province");
          if (!values.city) missing.push("city");

          return missing.length ? `Please complete ${missing.join(", ")}.` : "";
        },
        render: ({ values, setValues }) => (
          <div className="grid gap-4 lg:grid-cols-2">
            <Field label="Primary Phone Number">
              <Input
                value={values.primaryPhone}
                onChange={(event) => setValues((prev) => ({ ...prev, primaryPhone: event.target.value }))}
                placeholder="0330-0000000"
              />
            </Field>
            <Field label="Secondary Phone Number">
              <Input
                value={values.secondaryPhone}
                onChange={(event) => setValues((prev) => ({ ...prev, secondaryPhone: event.target.value }))}
                placeholder="0330-0000000"
              />
            </Field>
            <div className="lg:col-span-2">
              <Field label="Address">
                <Textarea
                  value={values.address}
                  onChange={(event) => setValues((prev) => ({ ...prev, address: event.target.value }))}
                  placeholder="Enter address"
                  className="min-h-28"
                />
              </Field>
            </div>
            <Field label="Province">
              <Select value={values.province} onValueChange={(province) => setValues((prev) => ({ ...prev, province }))}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select province" />
                </SelectTrigger>
                <SelectContent>
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
            </Field>
            <Field label="City">
              <Input
                value={values.city}
                onChange={(event) => setValues((prev) => ({ ...prev, city: event.target.value }))}
                placeholder="Enter city"
              />
            </Field>
          </div>
        ),
      },
      {
        value: "medicalInformation",
        label: "Medical Information",
        description: "Matches onboarding step 3.",
        successMessage: "Patient medical information updated.",
        validate: (values) => {
          const missing = [];

          if (!values.height) missing.push("height");
          if (!values.weight) missing.push("weight");
          if (!values.bloodGroup) missing.push("blood group");

          return missing.length ? `Please complete ${missing.join(", ")}.` : "";
        },
        render: ({ values, setValues }) => (
          <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Height (cm)">
                <Input
                  type="number"
                  value={values.height}
                  onChange={(event) => setValues((prev) => ({ ...prev, height: event.target.value }))}
                  placeholder="Enter height"
                />
              </Field>
              <Field label="Weight (kg)">
                <Input
                  type="number"
                  value={values.weight}
                  onChange={(event) => setValues((prev) => ({ ...prev, weight: event.target.value }))}
                  placeholder="Enter weight"
                />
              </Field>
            </div>

            <Field label="Blood Group">
              <Select value={values.bloodGroup} onValueChange={(bloodGroup) => setValues((prev) => ({ ...prev, bloodGroup }))}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select blood group" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Blood Group</SelectLabel>
                    {bloodGroupOptions.map((bloodGroup) => (
                      <SelectItem key={bloodGroup} value={bloodGroup}>
                        {bloodGroup}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </Field>

            <TagEditor
              label="Allergies"
              description="Keep the allergy list aligned with the patient intake form."
              values={values.allergies}
              onChange={(allergies) => setValues((prev) => ({ ...prev, allergies }))}
              suggestions={patientAllergies}
              placeholder="Type an allergy and press Add"
            />

            <TagEditor
              label="Chronic Conditions"
              description="Select or type chronic conditions from the original onboarding structure."
              values={values.chronicConditions}
              onChange={(chronicConditions) => setValues((prev) => ({ ...prev, chronicConditions }))}
              suggestions={chronicConditions}
              placeholder="Type a condition and press Add"
            />
          </div>
        ),
      },
      {
        value: "emergencyContact",
        label: "Emergency Contact",
        description: "Matches onboarding step 4.",
        successMessage: "Emergency contact updated.",
        validate: (values) => {
          const missing = [];

          if (!values.fullName) missing.push("full name");
          if (!values.relationship) missing.push("relationship");
          if (!values.phone) missing.push("phone number");

          return missing.length ? `Please complete ${missing.join(", ")}.` : "";
        },
        render: ({ values, setValues }) => (
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Full Name">
              <Input
                value={values.fullName}
                onChange={(event) => setValues((prev) => ({ ...prev, fullName: event.target.value }))}
                placeholder="Enter full name"
              />
            </Field>
            <Field label="Relationship">
              <Select
                value={values.relationship}
                onValueChange={(relationship) => setValues((prev) => ({ ...prev, relationship }))}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select relationship" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Relationship</SelectLabel>
                    {relationshipOptions.map((relationship) => (
                      <SelectItem key={relationship} value={relationship}>
                        {relationship}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </Field>
            <Field label="Phone Number">
              <Input
                value={values.phone}
                onChange={(event) => setValues((prev) => ({ ...prev, phone: event.target.value }))}
                placeholder="0330-0000000"
              />
            </Field>
            <Field label="Alternate Phone Number">
              <Input
                value={values.alternatePhone}
                onChange={(event) => setValues((prev) => ({ ...prev, alternatePhone: event.target.value }))}
                placeholder="0330-0000000"
              />
            </Field>
          </div>
        ),
      },
    ],
  };
}

function buildDoctorProfileConfig() {
  return {
    title: "Doctor Profile",
    description: "Profile sections mirror the doctor onboarding journey, including education, credentials, clinic data, and availability.",
    initialData: defaultDoctorData(),
    tabs: [
      {
        value: "personalInfo",
        label: "Personal Information",
        description: "Matches onboarding step 1.",
        successMessage: "Doctor personal information updated.",
        validate: (values) => {
          const missing = [];

          if (!values.fullName) missing.push("full name");
          if (!values.email) missing.push("email");
          if (!values.birthDate) missing.push("date of birth");
          if (!values.gender) missing.push("gender");

          return missing.length ? `Please complete ${missing.join(", ")}.` : "";
        },
        render: ({ values, setValues }) => (
          <div className="space-y-6">
            <AvatarField
              name={values.fullName}
              value={values.avatarUrl}
              onChange={(avatarUrl) => setValues((prev) => ({ ...prev, avatarUrl }))}
            />

            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Full Name">
                <Input
                  value={values.fullName}
                  onChange={(event) => setValues((prev) => ({ ...prev, fullName: event.target.value }))}
                  placeholder="Enter full name"
                />
              </Field>
              <Field label="Email">
                <Input
                  type="email"
                  value={values.email}
                  onChange={(event) => setValues((prev) => ({ ...prev, email: event.target.value }))}
                  placeholder="Enter email"
                />
              </Field>
              <Field label="Date of Birth">
                <Input
                  type="date"
                  value={values.birthDate}
                  onChange={(event) => setValues((prev) => ({ ...prev, birthDate: event.target.value }))}
                />
              </Field>
              <Field label="Gender">
                <Select value={values.gender} onValueChange={(gender) => setValues((prev) => ({ ...prev, gender }))}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Gender</SelectLabel>
                      {genderOptions.map((option) => (
                        <SelectItem key={option} value={option}>
                          {option.charAt(0).toUpperCase() + option.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </Field>
            </div>
          </div>
        ),
      },
      {
        value: "educationVerification",
        label: "Education Details",
        description: "Matches onboarding step 2 and stores credential verification metadata.",
        successMessage: "Education and verification details updated.",
        validate: (values) => {
          const missing = [];
          const hasEducation = values.educationEntries.some((entry) => entry.degree && entry.institution && entry.startYear && entry.endYear);

          if (!hasEducation) missing.push("at least one complete education entry");
          if (!values.licenseNumber) missing.push("license number");
          if (!values.medicalCouncil) missing.push("medical council");
          if (!values.verificationStatus) missing.push("verification status");

          return missing.length ? `Please complete ${missing.join(", ")}.` : "";
        },
        render: ({ values, setValues }) => (
          <div className="space-y-6">
            <SectionCard
              title="Education"
              description="Keep the education history aligned with the onboarding step structure."
            >
              <div className="space-y-4">
                {values.educationEntries.map((entry, index) => (
                  <div key={`${entry.degree || "education"}-${index}`} className="space-y-4 rounded-lg border p-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-medium">Education #{index + 1}</p>
                      {values.educationEntries.length > 1 ? (
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={() =>
                            setValues((prev) => ({
                              ...prev,
                              educationEntries: prev.educationEntries.filter((_, entryIndex) => entryIndex !== index),
                            }))
                          }
                        >
                          Remove
                        </Button>
                      ) : null}
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <Field label="Degree">
                        <Select
                          value={entry.degree}
                          onValueChange={(degree) =>
                            setValues((prev) => ({
                              ...prev,
                              educationEntries: prev.educationEntries.map((item, itemIndex) =>
                                itemIndex === index ? { ...item, degree } : item,
                              ),
                            }))
                          }
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select degree" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectGroup>
                              <SelectLabel>Degree</SelectLabel>
                              {degreeOptions.map((degree) => (
                                <SelectItem key={degree} value={degree}>
                                  {degree}
                                </SelectItem>
                              ))}
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                      </Field>
                      <Field label="Institution">
                        <Input
                          value={entry.institution}
                          onChange={(event) =>
                            setValues((prev) => ({
                              ...prev,
                              educationEntries: prev.educationEntries.map((item, itemIndex) =>
                                itemIndex === index ? { ...item, institution: event.target.value } : item,
                              ),
                            }))
                          }
                          placeholder="Enter institution"
                        />
                      </Field>
                      <Field label="Start Year">
                        <Input
                          type="number"
                          value={entry.startYear}
                          onChange={(event) =>
                            setValues((prev) => ({
                              ...prev,
                              educationEntries: prev.educationEntries.map((item, itemIndex) =>
                                itemIndex === index ? { ...item, startYear: event.target.value } : item,
                              ),
                            }))
                          }
                          placeholder="YYYY"
                        />
                      </Field>
                      <Field label="End Year">
                        <Input
                          type="number"
                          value={entry.endYear}
                          onChange={(event) =>
                            setValues((prev) => ({
                              ...prev,
                              educationEntries: prev.educationEntries.map((item, itemIndex) =>
                                itemIndex === index ? { ...item, endYear: event.target.value } : item,
                              ),
                            }))
                          }
                          placeholder="YYYY"
                        />
                      </Field>
                    </div>
                  </div>
                ))}

                <Button
                  type="button"
                  variant="outline"
                  onClick={() =>
                    setValues((prev) => ({
                      ...prev,
                      educationEntries: [
                        ...prev.educationEntries,
                        { degree: "", institution: "", startYear: "", endYear: "" },
                      ],
                    }))
                  }
                >
                  + Add Education
                </Button>
              </div>
            </SectionCard>

            <SectionCard title="Verification Info" description="A production profile often keeps the license and verification record with the education history.">
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="License Number">
                  <Input
                    value={values.licenseNumber}
                    onChange={(event) => setValues((prev) => ({ ...prev, licenseNumber: event.target.value }))}
                    placeholder="Enter license number"
                  />
                </Field>
                <Field label="Medical Council">
                  <Input
                    value={values.medicalCouncil}
                    onChange={(event) => setValues((prev) => ({ ...prev, medicalCouncil: event.target.value }))}
                    placeholder="Enter council name"
                  />
                </Field>
                <Field label="Verification Status">
                  <Select
                    value={values.verificationStatus}
                    onValueChange={(verificationStatus) => setValues((prev) => ({ ...prev, verificationStatus }))}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Status</SelectLabel>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="verified">Verified</SelectItem>
                        <SelectItem value="rejected">Rejected</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="Last Verified Date">
                  <Input
                    type="date"
                    value={values.lastVerified}
                    onChange={(event) => setValues((prev) => ({ ...prev, lastVerified: event.target.value }))}
                  />
                </Field>
              </div>
            </SectionCard>
          </div>
        ),
      },
      {
        value: "clinicDetails",
        label: "Work Place Details",
        description: "Matches onboarding step 3.",
        successMessage: "Clinic details updated.",
        validate: (values) => {
          const firstClinic = values.clinics[0];
          const missing = [];

          if (!firstClinic?.name) missing.push("clinic name");
          if (!firstClinic?.addressLine) missing.push("address");
          if (!firstClinic?.city) missing.push("city");
          if (!firstClinic?.province) missing.push("province");
          if (!firstClinic?.type) missing.push("clinic type");

          return missing.length ? `Please complete ${missing.join(", ")}.` : "";
        },
        render: ({ values, setValues }) => (
          <div className="space-y-4">
            {values.clinics.map((clinic, index) => (
              <SectionCard key={`${clinic.name || "clinic"}-${index}`} title={`Clinic / Hospital #${index + 1}`} description="Keep every workplace entry in sync with onboarding.">
                <div className="space-y-4">
                  <Field label="Clinic / Hospital Name">
                    <Input
                      value={clinic.name}
                      onChange={(event) =>
                        setValues((prev) => ({
                          ...prev,
                          clinics: prev.clinics.map((item, itemIndex) =>
                            itemIndex === index ? { ...item, name: event.target.value } : item,
                          ),
                        }))
                      }
                      placeholder="Enter clinic or hospital name"
                    />
                  </Field>

                  <Field label="Address">
                    <Textarea
                      value={clinic.addressLine}
                      onChange={(event) =>
                        setValues((prev) => ({
                          ...prev,
                          clinics: prev.clinics.map((item, itemIndex) =>
                            itemIndex === index ? { ...item, addressLine: event.target.value } : item,
                          ),
                        }))
                      }
                      placeholder="Enter clinic address"
                      className="min-h-24"
                    />
                  </Field>

                  <div className="grid gap-4 md:grid-cols-2">
                    <Field label="City">
                      <Input
                        value={clinic.city}
                        onChange={(event) =>
                          setValues((prev) => ({
                            ...prev,
                            clinics: prev.clinics.map((item, itemIndex) =>
                              itemIndex === index ? { ...item, city: event.target.value } : item,
                            ),
                          }))
                        }
                        placeholder="Enter city"
                      />
                    </Field>
                    <Field label="Province">
                      <Select
                        value={clinic.province}
                        onValueChange={(province) =>
                          setValues((prev) => ({
                            ...prev,
                            clinics: prev.clinics.map((item, itemIndex) =>
                              itemIndex === index ? { ...item, province } : item,
                            ),
                          }))
                        }
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select province" />
                        </SelectTrigger>
                        <SelectContent>
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
                    </Field>
                    <Field label="Clinic / Hospital Type">
                      <Select
                        value={clinic.type}
                        onValueChange={(type) =>
                          setValues((prev) => ({
                            ...prev,
                            clinics: prev.clinics.map((item, itemIndex) =>
                              itemIndex === index ? { ...item, type } : item,
                            ),
                          }))
                        }
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectLabel>Type</SelectLabel>
                            {clinicTypeOptions.map((type) => (
                              <SelectItem key={type} value={type}>
                                {type.charAt(0).toUpperCase() + type.slice(1)}
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </Field>
                    <Field label="Contact Number">
                      <Input
                        value={clinic.contactNumber}
                        onChange={(event) =>
                          setValues((prev) => ({
                            ...prev,
                            clinics: prev.clinics.map((item, itemIndex) =>
                              itemIndex === index ? { ...item, contactNumber: event.target.value } : item,
                            ),
                          }))
                        }
                        placeholder="Clinic phone number"
                      />
                    </Field>
                    <Field label="Postal Code">
                      <Input
                        value={clinic.postalCode}
                        onChange={(event) =>
                          setValues((prev) => ({
                            ...prev,
                            clinics: prev.clinics.map((item, itemIndex) =>
                              itemIndex === index ? { ...item, postalCode: event.target.value } : item,
                            ),
                          }))
                        }
                        placeholder="Enter postal code"
                      />
                    </Field>
                  </div>

                  {values.clinics.length > 1 ? (
                    <div>
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() =>
                          setValues((prev) => ({
                            ...prev,
                            clinics: prev.clinics.filter((_, clinicIndex) => clinicIndex !== index),
                          }))
                        }
                      >
                        Remove Clinic
                      </Button>
                    </div>
                  ) : null}
                </div>
              </SectionCard>
            ))}

            <Button
              type="button"
              variant="outline"
              onClick={() =>
                setValues((prev) => ({
                  ...prev,
                  clinics: [
                    ...prev.clinics,
                    {
                      name: "",
                      addressLine: "",
                      city: "",
                      province: "",
                      postalCode: "",
                      type: "",
                      contactNumber: "",
                    },
                  ],
                }))
              }
            >
              + Add Another Clinic
            </Button>
          </div>
        ),
      },
      {
        value: "specializationExperience",
        label: "Professional Details",
        description: "Matches onboarding step 4.",
        successMessage: "Specialization and experience updated.",
        validate: (values) => {
          const missing = [];

          if (!values.specialization) missing.push("specialization");
          if (!values.yearsExperience) missing.push("years of experience");
          if (!values.consultationFee) missing.push("consultation fee");

          return missing.length ? `Please complete ${missing.join(", ")}.` : "";
        },
        render: ({ values, setValues }) => (
          <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Specialization">
                <Select
                  value={values.specialization}
                  onValueChange={(specialization) => setValues((prev) => ({ ...prev, specialization }))}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select specialization" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Specialization</SelectLabel>
                      {specializationOptions.map((specialization) => (
                        <SelectItem key={specialization} value={specialization}>
                          {specialization}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Years of Experience">
                <Input
                  type="number"
                  value={values.yearsExperience}
                  onChange={(event) => setValues((prev) => ({ ...prev, yearsExperience: event.target.value }))}
                  placeholder="Enter years of experience"
                />
              </Field>
              <Field label="Consultation Fee (PKR)">
                <Input
                  type="number"
                  value={values.consultationFee}
                  onChange={(event) => setValues((prev) => ({ ...prev, consultationFee: event.target.value }))}
                  placeholder="Enter consultation fee"
                />
              </Field>
            </div>

            <SectionCard
              title="Additional Courses / Workshops / Diplomas"
              description="Keep the extra training list aligned with the onboarding data model."
            >
              <div className="space-y-4">
                {values.courses.map((course, index) => (
                  <div key={`${course.name || "course"}-${index}`} className="grid gap-4 md:grid-cols-[1fr_1fr_auto]">
                    <Field label="Course or Diploma Name">
                      <Input
                        value={course.name}
                        onChange={(event) =>
                          setValues((prev) => ({
                            ...prev,
                            courses: prev.courses.map((item, itemIndex) =>
                              itemIndex === index ? { ...item, name: event.target.value } : item,
                            ),
                          }))
                        }
                        placeholder="Enter course or diploma"
                      />
                    </Field>
                    <Field label="Certificate Filename">
                      <Input
                        value={course.certificateName || ""}
                        onChange={(event) =>
                          setValues((prev) => ({
                            ...prev,
                            courses: prev.courses.map((item, itemIndex) =>
                              itemIndex === index ? { ...item, certificateName: event.target.value } : item,
                            ),
                          }))
                        }
                        placeholder="certificate.pdf"
                      />
                    </Field>
                    <div className="flex items-end">
                      {values.courses.length > 1 ? (
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={() =>
                            setValues((prev) => ({
                              ...prev,
                              courses: prev.courses.filter((_, courseIndex) => courseIndex !== index),
                            }))
                          }
                        >
                          Remove
                        </Button>
                      ) : null}
                    </div>
                  </div>
                ))}

                <Button
                  type="button"
                  variant="outline"
                  onClick={() =>
                    setValues((prev) => ({
                      ...prev,
                      courses: [...prev.courses, { name: "", certificateName: "" }],
                    }))
                  }
                >
                  + Add Course
                </Button>
              </div>
            </SectionCard>
          </div>
        ),
      },
      {
        value: "bioLanguages",
        label: "Bio",
        description: "Matches onboarding step 5.",
        successMessage: "Bio and language preferences updated.",
        validate: (values) => {
          const missing = [];

          if (!values.bio) missing.push("bio");
          if (!values.languages.length) missing.push("at least one language");

          return missing.length ? `Please complete ${missing.join(", ")}.` : "";
        },
        render: ({ values, setValues }) => (
          <div className="space-y-6">
            <Field label="Short Bio">
              <Textarea
                value={values.bio}
                onChange={(event) => setValues((prev) => ({ ...prev, bio: event.target.value }))}
                placeholder="Write a short professional bio"
                className="min-h-32"
              />
            </Field>

            <TagEditor
              label="Skills"
              description="Select skills that should appear on the public doctor profile."
              values={values.skills}
              onChange={(skills) => setValues((prev) => ({ ...prev, skills }))}
              suggestions={doctorSkills}
              placeholder="Type a skill and press Add"
            />

            <TagEditor
              label="Languages"
              description="Keep the spoken languages aligned with onboarding."
              values={values.languages}
              onChange={(languages) => setValues((prev) => ({ ...prev, languages }))}
              suggestions={languageOptions}
              placeholder="Type a language and press Add"
            />
          </div>
        ),
      },
      {
        value: "availability",
        label: "Set Your Availability",
        description: "Matches onboarding step 6.",
        successMessage: "Availability updated.",
        validate: (values) => {
          const hasSlot = values.schedule.some((day) => day.slots.some((slot) => slot.start && slot.end));
          return hasSlot ? "" : "Please add at least one complete availability slot.";
        },
        render: ({ values, setValues }) => (
          <div className="space-y-4">
            {values.schedule.map((day, dayIndex) => (
              <SectionCard key={day.day} title={day.day} description="Add one or more time ranges for this day.">
                <div className="space-y-4">
                  {day.slots.map((slot, slotIndex) => (
                    <div key={`${day.day}-${slotIndex}`} className="grid gap-4 md:grid-cols-[1fr_1fr_auto]">
                      <Field label="Start Time">
                        <Input
                          type="time"
                          value={slot.start}
                          onChange={(event) =>
                            setValues((prev) => ({
                              ...prev,
                              schedule: prev.schedule.map((item, itemIndex) =>
                                itemIndex === dayIndex
                                  ? {
                                      ...item,
                                      slots: item.slots.map((entry, entryIndex) =>
                                        entryIndex === slotIndex ? { ...entry, start: event.target.value } : entry,
                                      ),
                                    }
                                  : item,
                              ),
                            }))
                          }
                        />
                      </Field>
                      <Field label="End Time">
                        <Input
                          type="time"
                          value={slot.end}
                          onChange={(event) =>
                            setValues((prev) => ({
                              ...prev,
                              schedule: prev.schedule.map((item, itemIndex) =>
                                itemIndex === dayIndex
                                  ? {
                                      ...item,
                                      slots: item.slots.map((entry, entryIndex) =>
                                        entryIndex === slotIndex ? { ...entry, end: event.target.value } : entry,
                                      ),
                                    }
                                  : item,
                              ),
                            }))
                          }
                        />
                      </Field>
                      <div className="flex items-end">
                        {day.slots.length > 1 ? (
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            onClick={() =>
                              setValues((prev) => ({
                                ...prev,
                                schedule: prev.schedule.map((item, itemIndex) =>
                                  itemIndex === dayIndex
                                    ? { ...item, slots: item.slots.filter((_, entryIndex) => entryIndex !== slotIndex) }
                                    : item,
                                ),
                              }))
                            }
                          >
                            Remove
                          </Button>
                        ) : null}
                      </div>
                    </div>
                  ))}

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setValues((prev) => ({
                        ...prev,
                        schedule: prev.schedule.map((item, itemIndex) =>
                          itemIndex === dayIndex
                            ? { ...item, slots: [...item.slots, { start: "", end: "" }] }
                            : item,
                        ),
                      }))
                    }
                  >
                    + Add Slot
                  </Button>
                </div>
              </SectionCard>
            ))}
          </div>
        ),
      },
    ],
  };
}

function buildAdminProfileConfig() {
  return {
    title: "Admin Profile",
    description: "Admin profile settings stay inside the same dashboard design system and use editable form sections.",
    initialData: defaultAdminData(),
    tabs: [
      {
        value: "personalInfo",
        label: "Personal Information",
        description: "Basic admin identity details.",
        successMessage: "Admin personal information updated.",
        validate: (values) => {
          const missing = [];

          if (!values.fullName) missing.push("full name");
          if (!values.email) missing.push("email");
          if (!values.phone) missing.push("phone number");

          return missing.length ? `Please complete ${missing.join(", ")}.` : "";
        },
        render: ({ values, setValues }) => (
          <div className="space-y-6">
            <AvatarField
              name={values.fullName}
              value={values.avatarUrl}
              onChange={(avatarUrl) => setValues((prev) => ({ ...prev, avatarUrl }))}
            />
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Full Name">
                <Input
                  value={values.fullName}
                  onChange={(event) => setValues((prev) => ({ ...prev, fullName: event.target.value }))}
                  placeholder="Enter full name"
                />
              </Field>
              <Field label="Email">
                <Input
                  type="email"
                  value={values.email}
                  onChange={(event) => setValues((prev) => ({ ...prev, email: event.target.value }))}
                  placeholder="Enter email"
                />
              </Field>
              <Field label="Phone Number">
                <Input
                  value={values.phone}
                  onChange={(event) => setValues((prev) => ({ ...prev, phone: event.target.value }))}
                  placeholder="Enter phone number"
                />
              </Field>
            </div>
          </div>
        ),
      },
      {
        value: "accountSettings",
        label: "Account Settings",
        description: "Manage credentials, preferences, and notification behavior.",
        successMessage: "Account settings updated.",
        validate: (values) => {
          const missing = [];

          if (!values.username) missing.push("username");
          if (!values.timezone) missing.push("timezone");
          if (!values.language) missing.push("language");
          if (!values.notificationMethod) missing.push("notification method");

          return missing.length ? `Please complete ${missing.join(", ")}.` : "";
        },
        render: ({ values, setValues }) => (
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Username">
              <Input
                value={values.username}
                onChange={(event) => setValues((prev) => ({ ...prev, username: event.target.value }))}
                placeholder="Enter username"
              />
            </Field>
            <Field label="Timezone">
              <Select value={values.timezone} onValueChange={(timezone) => setValues((prev) => ({ ...prev, timezone }))}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select timezone" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Timezone</SelectLabel>
                    {timezoneOptions.map((timezone) => (
                      <SelectItem key={timezone} value={timezone}>
                        {timezone}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </Field>
            <Field label="Display Language">
              <Select value={values.language} onValueChange={(language) => setValues((prev) => ({ ...prev, language }))}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Language</SelectLabel>
                    <SelectItem value="English">English</SelectItem>
                    <SelectItem value="Urdu">Urdu</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </Field>
            <Field label="Notification Method">
              <Select
                value={values.notificationMethod}
                onValueChange={(notificationMethod) => setValues((prev) => ({ ...prev, notificationMethod }))}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Notifications</SelectLabel>
                    {notificationOptions.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option.charAt(0).toUpperCase() + option.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </Field>
            <Field label="Theme Preference">
              <Select
                value={values.themePreference}
                onValueChange={(themePreference) => setValues((prev) => ({ ...prev, themePreference }))}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select theme" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Theme</SelectLabel>
                    {themeOptions.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option.charAt(0).toUpperCase() + option.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </Field>
          </div>
        ),
      },
      {
        value: "systemRoleInfo",
        label: "Role Information",
        description: "Keep the admin role, scope, and access level available for audit and support workflows.",
        successMessage: "System role information updated.",
        validate: (values) => {
          const missing = [];

          if (!values.role) missing.push("role");
          if (!values.department) missing.push("department");
          if (!values.accessScope) missing.push("access scope");
          if (!values.mfaEnabled) missing.push("MFA setting");

          return missing.length ? `Please complete ${missing.join(", ")}.` : "";
        },
        render: ({ values, setValues }) => (
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="System Role">
              <Select value={values.role} onValueChange={(role) => setValues((prev) => ({ ...prev, role }))}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Role</SelectLabel>
                    {roleOptions.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </Field>
            <Field label="Department">
              <Select
                value={values.department}
                onValueChange={(department) => setValues((prev) => ({ ...prev, department }))}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Department</SelectLabel>
                    {departmentOptions.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </Field>
            <div className="md:col-span-2">
              <Field label="Access Scope" description="Describe the systems or workflows this admin can manage.">
                <Textarea
                  value={values.accessScope}
                  onChange={(event) => setValues((prev) => ({ ...prev, accessScope: event.target.value }))}
                  placeholder="Describe access scope"
                  className="min-h-28"
                />
              </Field>
            </div>
            <Field label="Multi-Factor Authentication">
              <Select
                value={values.mfaEnabled}
                onValueChange={(mfaEnabled) => setValues((prev) => ({ ...prev, mfaEnabled }))}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select MFA status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>MFA</SelectLabel>
                    <SelectItem value="enabled">Enabled</SelectItem>
                    <SelectItem value="disabled">Disabled</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </Field>
            <div className="flex items-end gap-2 md:justify-end">
              <Badge variant="secondary">Dashboard access</Badge>
              <Badge variant="outline">Audit ready</Badge>
            </div>
          </div>
        ),
      },
    ],
  };
}

export const patientProfileConfig = buildPatientProfileConfig();
export const doctorProfileConfig = buildDoctorProfileConfig();
export const adminProfileConfig = buildAdminProfileConfig();
export { SectionCard, Field, TagEditor, AvatarField, clone, initials };
