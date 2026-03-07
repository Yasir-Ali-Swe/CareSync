import React from "react";
import {
  CalendarCheck,
  ShieldCheck,
  Clock,
  Stethoscope,
  CreditCard,
  UserCheck,
} from "lucide-react";

const whyUsData = [
  {
    icon: CalendarCheck,
    title: "Easy Appointment Booking",
    description: "Book doctor appointments in seconds.",
  },
  {
    icon: Stethoscope,
    title: "Verified Doctors",
    description: "Consult trusted and verified specialists.",
  },
  {
    icon: Clock,
    title: "24/7 Access",
    description: "Find doctors anytime you need care.",
  },
  {
    icon: ShieldCheck,
    title: "Secure Health Data",
    description: "Your medical information stays protected.",
  },
  {
    icon: UserCheck,
    title: "Trusted by Patients",
    description: "Thousands rely on CareSync daily.",
  },
  {
    icon: CreditCard,
    title: "Simple Payments",
    description: "Fast and secure online payments.",
  },
];
const WhyChooseUs = () => {
  return (
    <div className="my-8 w-full">
      <h1 className="text-center text-primary font-semibold text-3xl">
        Why Choose Us?
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-8">
        {whyUsData.map((item, index) => (
          <div
            key={index}
            className="flex flex-col items-center text-center p-4 border bg-card shadow-md rounded-2xl"
          >
            <item.icon className="w-12 h-12 text-primary mb-4" />
            <h3 className="text-lg font-semibold text-primary mb-2">
              {item.title}
            </h3>
            <p className="text-muted-foreground">{item.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WhyChooseUs;
