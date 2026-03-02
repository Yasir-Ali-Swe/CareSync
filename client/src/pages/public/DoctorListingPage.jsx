import React from "react";
import { useSearchParams } from "react-router-dom";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

const doctors = [
  { id: 1, name: "Dr. A", city: "Faisalabad", specialization: "Cardiology" },
  { id: 2, name: "Dr. B", city: "Lahore", specialization: "Dermatology" },
  { id: 3, name: "Dr. C", city: "Karachi", specialization: "Neurology" },
  { id: 4, name: "Dr. D", city: "Lahore", specialization: "Urology" },
  { id: 5, name: "Dr. E", city: "Faisalabad", specialization: "Dermatology" },
  { id: 6, name: "Dr. F", city: "Islamabad", specialization: "Cardiology" },
  { id: 7, name: "Dr. G", city: "Karachi", specialization: "Orthopedics" },
  { id: 8, name: "Dr. H", city: "Lahore", specialization: "Neurology" },
  { id: 9, name: "Dr. I", city: "Faisalabad", specialization: "Urology" },
  { id: 10, name: "Dr. J", city: "Islamabad", specialization: "Dermatology" },
  { id: 11, name: "Dr. K", city: "Karachi", specialization: "Cardiology" },
  { id: 12, name: "Dr. L", city: "Lahore", specialization: "Pediatrics" },
  { id: 13, name: "Dr. M", city: "Faisalabad", specialization: "Orthopedics" },
  { id: 14, name: "Dr. N", city: "Islamabad", specialization: "Neurology" },
  { id: 15, name: "Dr. O", city: "Karachi", specialization: "Urology" },
  { id: 16, name: "Dr. P", city: "Lahore", specialization: "Cardiology" },
  { id: 17, name: "Dr. Q", city: "Faisalabad", specialization: "Dermatology" },
  { id: 18, name: "Dr. R", city: "Islamabad", specialization: "Pediatrics" },
  { id: 19, name: "Dr. S", city: "Karachi", specialization: "Orthopedics" },
  { id: 20, name: "Dr. T", city: "Lahore", specialization: "Urology" },
];

const DoctorListingPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const filters = Object.fromEntries([...searchParams]);
  const city = filters.city || "";
  const specialization = filters.specialization || "";

  const updateFilters = (newFilters) => {
    const updatedFilters = new URLSearchParams(searchParams);
    Object.entries(newFilters).forEach(([key, value]) => {
      if (value) {
        updatedFilters.set(key, value);
      } else {
        updatedFilters.delete(key);
      }
    });
    setSearchParams(updatedFilters);
  };

  const cities = [...new Set(doctors.map((doc) => doc.city))];
  const specializations = [
    ...new Set(doctors.map((doc) => doc.specialization)),
  ];

  const filteredDoctors = doctors.filter((doc) => {
    return (
      (!city || doc.city === city || city === "All Cities") &&
      (!specialization ||
        doc.specialization === specialization ||
        specialization === "All Specializations")
    );
  });

  return (
    <div className="h-full flex flex-col items-center">
      <h1 className="text-3xl text-primary font-bold mt-20">
        Welcome to CareSync
      </h1>
      <p className="text-xl font-semibold">Doctor Listing Page</p>
      <div className="flex items-center gap-8 mt-5">
        <Select
          value={city}
          onValueChange={(value) => updateFilters({ city: value })}
        >
          <SelectTrigger className="w-45">
            <SelectValue placeholder="Select City" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>City</SelectLabel>
              <SelectItem value="All Cities">All Cities</SelectItem>
              {cities.map((city) => (
                <SelectItem key={city} value={city}>
                  {city}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
        <Select
          value={specialization}
          onValueChange={(value) => updateFilters({ specialization: value })}
        >
          <SelectTrigger className="w-45">
            <SelectValue placeholder="Select Specialization" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Specialization</SelectLabel>
              <SelectItem value="All Specializations">
                All Specializations
              </SelectItem>
              {specializations.map((spec) => (
                <SelectItem key={spec} value={spec}>
                  {spec}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
        <Button variant="destructive" onClick={() => setSearchParams({})}>
          Clear Filters
        </Button>
      </div>
      <div className="mt-10 w-full max-w-3xl">
        {filteredDoctors.length > 0 ? (
          filteredDoctors.map((doc) => (
            <div
              key={doc.id}
              className="p-4 mb-4 border rounded-md transition-all duration-500"
            >
              <h2 className="text-xl font-bold">{doc.name}</h2>
              <p className="text-gray-600">
                {doc.specialization} - {doc.city}
              </p>
            </div>
          ))
        ) : (
          <p className="text-center text-gray-500">No doctors found.</p>
        )}
      </div>
    </div>
  );
};

export default DoctorListingPage;
