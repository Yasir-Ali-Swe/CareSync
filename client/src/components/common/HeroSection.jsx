import React from "react";
import { Link, useSearchParams } from "react-router-dom";
import DoctorsData from "@/dummyData/DoctorData.js";
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

const HomeHeroSection = ({
  Img = "/img8.png",
  firstText = "Find trusted doctors and ",
  secondaryText = "book appointments ",
  thirdText = "easily near you today",
  showFilters = true,
}) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const filters = Object.fromEntries([...searchParams]);
  const city = filters.city ?? "";
  const specialization = filters.specialization ?? "";
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
  return (
    <div className="w-full rounded-2xl overflow-hidden my-2 flex flex-col md:flex-row border bg-card shadow-md">
      {/* Left Content */}
      <div className="w-full my-2 md:my-0 md:w-1/2 px-6 flex flex-col justify-center space-y-4 order-2 md:order-1">
        <h1 className="text-2xl  lg:text-3xl text-center md:text-left font-bold text-chart-2">
          {firstText} <span className="text-primary">{secondaryText}</span>{" "}
          {thirdText}
        </h1>
        <div className="inline-flex items-center mx-auto md:mx-0 space-x-2 bg-primary px-3 py-1 rounded-md w-max ">
          <span className="w-3 h-3 rounded-full bg-green-500 inline-block"></span>
          <span className="text-chart-4 font-semibold">
            50M+ patients served
          </span>
        </div>
        {showFilters && (
          <div className="mt-4 hidden md:flex">
            <div className="flex-1 flex items-center gap-2">
              <Select
                value={city}
                onValueChange={(val) =>
                  updateFilters({ city: val || undefined })
                }
              >
                <SelectTrigger className="w-[30%] rounded-sm">
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
              <div className="border-2 border-border bg-border h-full w-1 " />
              <Select
                value={specialization}
                onValueChange={(val) =>
                  updateFilters({ specialization: val || undefined })
                }
              >
                <SelectTrigger className="w-[30%] rounded-sm">
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
              <Link
                to={`/doctors?${new URLSearchParams(filters)}`}
                className="h-full"
              >
                <Button className={"rounded-sm"}>Find Doctor</Button>
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Right Image */}
      <div className="w-full md:w-1/2 flex justify-center items-center order-1 md:order-2">
        <img
          src={Img}
          alt="Doctor"
          className="size-120 md:w-full object-contain"
        />
      </div>
    </div>
  );
};

export default HomeHeroSection;
