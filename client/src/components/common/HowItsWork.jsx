import React from "react";
import { Search, Calendar, UserCheck } from "lucide-react";

const howItWorks = [
  {
    id: 1,
    title: "Search Doctor",
    description:
      "Find the best doctors by specialty, location, or name quickly.",
    icon: <Search size={32} />,
  },
  {
    id: 2,
    title: "Book Appointment",
    description:
      "Choose a time slot that suits you and confirm instantly online.",
    icon: <Calendar size={32} />,
  },
  {
    id: 3,
    title: "Consult & Get Treatment",
    description: "Visit in person or consult online and get proper care.",
    icon: <UserCheck size={32} />,
  },
];
const HowItsWork = () => {
  return (
    <div className="my-8 w-full">
      <h1 className="text-center text-primary font-semibold text-3xl">
        How It Works
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        {howItWorks.map((step) => (
          <div
            key={step.id}
            className="flex flex-col items-center text-center p-4 dark:bg-muted/10 bg-card rounded-sm shadow-lg"
          >
            {step.icon}
            <h3 className="text-lg font-semibold text-primary mt-4 mb-2">
              {step.title}
            </h3>
            <p className="text-muted-foreground">{step.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HowItsWork;
