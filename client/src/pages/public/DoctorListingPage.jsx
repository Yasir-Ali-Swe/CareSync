import React from "react";
import { useSearchParams } from "react-router-dom";
import { Funnel } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import DoctorsData from "@/dummyData/DoctorData.js";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
const DoctorListingPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const filters = Object.fromEntries([...searchParams]);
  const city = filters.city ?? "";
  const specialization = filters.specialization ?? "";
  const verified = filters.verified ?? "";

  const updateFilters = (newFilters) => {
    const updatedParams = new URLSearchParams(searchParams);

    Object.entries(newFilters).forEach(([key, value]) => {
      if (value) updatedParams.set(key, value);
      else updatedParams.delete(key);
    });

    setSearchParams(updatedParams);
  };

  const cities = [...new Set(DoctorsData.map((doc) => doc.city))];
  const specializations = [
    ...new Set(DoctorsData.map((doc) => doc.specialization)),
  ];

  const filteredDoctors = DoctorsData.filter((doc) => {
    const verifiedMatch =
      !verified || verified === "All" || String(doc.verified) === verified;
    const cityMatch = !city || city === "All" || doc.city === city;
    const specializationMatch =
      !specialization ||
      specialization === "All" ||
      doc.specialization === specialization;
    return verifiedMatch && cityMatch && specializationMatch;
  });

  return (
    <div className="h-full flex flex-col items-center p-10 max-w-7xl mx-auto">
      <h1 className="text-3xl text-primary font-bold mb-2">
        Welcome to CareSync
      </h1>
      <p className="text-xl font-semibold mb-5">Doctor Listing Page</p>
      <div className="place-self-end my-5 space-x-2">
        <Dialog>
          <DialogTrigger asChild>
            <Button className={"rounded-sm"}>Filters</Button>
          </DialogTrigger>
          <DialogContent className={"sm:max-w-sm"}>
            <DialogHeader>
              <DialogTitle>Filter Doctors</DialogTitle>
              <DialogDescription>
                Use the filters on the left to narrow down your doctor search.
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col justify-center items-center gap-5 w-full">
              <Select
                value={city}
                onValueChange={(val) =>
                  updateFilters({ city: val || undefined })
                }
              >
                <SelectTrigger className="w-[70%] rounded-sm">
                  <SelectValue placeholder="Select City" />
                </SelectTrigger>
                <SelectContent className={"rounded-sm"}>
                  <SelectGroup>
                    <SelectLabel>City</SelectLabel>
                    <SelectItem value="All">All Cities</SelectItem>
                    {cities.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
              <Select
                value={verified}
                onValueChange={(val) =>
                  updateFilters({ verified: val || undefined })
                }
              >
                <SelectTrigger className="w-[70%] rounded-sm">
                  <SelectValue placeholder="Select Doctor" />
                </SelectTrigger>
                <SelectContent className={"rounded-sm"}>
                  <SelectGroup>
                    <SelectLabel>Doctor</SelectLabel>
                    <SelectItem value="All">All Doctors</SelectItem>
                    <SelectItem value="true">Verified</SelectItem>
                    <SelectItem value="false">Unverified</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
              <Select
                value={specialization}
                onValueChange={(val) =>
                  updateFilters({ specialization: val || undefined })
                }
              >
                <SelectTrigger className="w-[70%] rounded-sm">
                  <SelectValue placeholder="Select Specialization" />
                </SelectTrigger>
                <SelectContent className={"rounded-sm"}>
                  <SelectGroup>
                    <SelectLabel>Specialization</SelectLabel>
                    <SelectItem value="All">All Specializations</SelectItem>
                    {specializations.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </DialogContent>
        </Dialog>
        <Button
          className={"rounded-sm"}
          variant="destructive"
          onClick={() => {
            updateFilters({
              city: undefined,
              specialization: undefined,
              verified: undefined,
            });
          }}
        >
          Clear Filters
        </Button>
      </div>

      {/* Doctor List */}
      <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 px-4 sm:px-6 lg:px-0 ">
        {filteredDoctors.length > 0 ? (
          filteredDoctors.map((doc) => (
            <div
              key={doc.id}
              className="relative p-5 rounded-sm shadow-md hover:shadow-lg transition transform hover:-translate-y-1 flex flex-col items-center bg-card"
            >
              {/* Avatar */}
              <div className="place-self-end">
                {doc.verified && (
                  <Badge className={"absolute top-3 right-3 bg-green-600 text-white font-semibold"}>
                    Verified
                  </Badge>
                )}
              </div>
              <Avatar className="w-20 h-20 mb-3 shadow-lg">
                <AvatarImage
                  src={`https://i.pravatar.cc/150?img=${doc.id}`}
                  alt={doc.fullName}
                />
                <AvatarFallback>{doc.fullName[0]}</AvatarFallback>
              </Avatar>

              {/* Name & Specialization */}
              <div className="text-center mb-3">
                <p className="font-bold text-lg text-primary">{doc.fullName}</p>
                <p className="text-sm text-muted-foreground">
                  {doc.city} - {doc.specialization}
                </p>
                <p
                  title={doc.bioShort}
                  className="text-sm font-medium text-primary line-clamp-1 mt-1"
                >
                  {doc.bioShort}
                </p>
              </div>

              <div className="flex justify-between w-full mt-3 mb-4 gap-3">
                <div className="flex flex-col items-center justify-center p-2 bg-secondary rounded-sm w-1/3">
                  <p className="text-xs text-muted-foreground">Experience</p>
                  <p className="font-semibold text-sm">
                    {doc.experienceYears} yrs
                  </p>
                </div>
                <div className="flex flex-col items-center justify-center p-2 bg-secondary rounded-sm w-1/3">
                  <p className="text-xs text-muted-foreground">Rating</p>
                  <p className="font-semibold text-sm">{doc.rating} ⭐</p>
                </div>
                <div className="flex flex-col items-center justify-center p-2 bg-secondary rounded-sm w-1/3">
                  <p className="text-xs text-muted-foreground">Fee</p>
                  <p className="font-semibold text-sm">{doc.consultationFee}</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-row justify-center items-center gap-3 w-full mt-auto">
                <Link to={`/book-appointment/${doc.id}`} className="w-[50%]">
                  <Button className="w-full rounded-sm">Book</Button>
                </Link>
                <Link to={`/messages/${doc.id}`} className="w-[50%]">
                  <Button className="w-full rounded-sm" variant="outline">
                    Chat
                  </Button>
                </Link>
              </div>

              <Link to={`/doctor-profile/${doc.id}`} className="w-full mt-2">
                <Button variant="outline" className="w-full rounded-sm">
                  View Profile
                </Button>
              </Link>
            </div>
          ))
        ) : (
          <p className="col-span-full text-center text-muted-foreground">
            No doctors found for selected filters.
          </p>
        )}
      </div>
    </div>
  );
};

export default DoctorListingPage;
