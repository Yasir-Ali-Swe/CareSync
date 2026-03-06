import React from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const specialized = [
  { Image: "/img11.png", name: "Dermatologist" },
  { Image: "/img12.png", name: "Gynecologist" },
  { Image: "/img13.png", name: "Urologist" },
  { Image: "/img14.png", name: "Gastroenterologist" },
  { Image: "/img15.png", name: "Dentist" },
  { Image: "/img16.png", name: "Obesity Specialist" },
  { Image: "/img17.png", name: "ENT Specialist" },
  { Image: "/img18.png", name: "Orthopedic Surgeon" },
  { Image: "/img19.png", name: "Sexologist" },
  { Image: "/img20.png", name: "Neurologist" },
  { Image: "/img21.png", name: "Child Specialist" },
  { Image: "/img22.png", name: "Pulmonologist" },
  { Image: "/img23.png", name: "Eye Specialist" },
];
const SpecilizedDoctors = () => {
  return (
    <div className="my-8 w-full">
      <div className="flex justify-between items-center w-full">
        <h1 className="text-lg lg:text-xl font-semibold text-primary">
          Consult best doctors online
        </h1>
        <Link to="/doctors">
          <Button
            variant="link"
            className="text-lg lg:text-xl font-semibold text-primary rounded-sm cursor-pointer"
          >
            View All
          </Button>
        </Link>
      </div>
      <div className="flex flex-wrap justify-center gap-5 xl:gap-20 w-full my-4">
        {specialized.map((s) => (
          <Link
            to={`/doctors?specialization=${s.name}`}
            key={s.name}
            className="flex flex-col justify-center items-center gap-2"
          >
            <img
              src={s.Image}
              alt={s.name}
              className="size-25 rounded-full object-cover"
            />
            <span className="text-sm text-primary">{s.name}</span>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default SpecilizedDoctors;
