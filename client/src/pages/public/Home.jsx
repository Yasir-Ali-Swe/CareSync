import React from "react";
import { Button } from "@/components/ui/button";
import DoctorsData from "@/dummyData/DoctorData.js";
import { useSearchParams, Link } from "react-router-dom";
import { useRef } from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  CalendarCheck,
  ShieldCheck,
  Clock,
  Stethoscope,
  CreditCard,
  Search,
  Calendar,
  UserCheck,
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
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
const howItWorks = [
  {
    id: 1,
    title: "Search Doctor",
    description:
      "Find the best doctors by specialty, location, or name quickly.",
    icon: <Search size={32} />, // Lucide icon component
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

const patientReviews = [
  {
    id: 1,
    name: "Ayesha Khan",
    location: "Karachi, Pakistan",
    review:
      "The platform made finding a specialist so simple. Booking was instant!",
    rating: 5,
    avatar: "https://randomuser.me/api/portraits/women/65.jpg",
  },
  {
    id: 2,
    name: "Ali Raza",
    location: "Lahore, Pakistan",
    review:
      "I got an appointment within minutes. Doctors are very professional.",
    rating: 4,
    avatar: "https://randomuser.me/api/portraits/men/32.jpg",
  },
  {
    id: 3,
    name: "Sara Ahmed",
    location: "Islamabad, Pakistan",
    review: "Easy to use platform and excellent online consultation service.",
    rating: 5,
    avatar: "https://randomuser.me/api/portraits/women/44.jpg",
  },
  {
    id: 4,
    name: "Hamza Ali",
    location: "Karachi, Pakistan",
    review: "Fast and reliable service, highly recommend!",
    rating: 5,
    avatar: "https://randomuser.me/api/portraits/men/50.jpg",
  },
  {
    id: 5,
    name: "Fatima Noor",
    location: "Lahore, Pakistan",
    review: "Booking was smooth and the doctor was excellent.",
    rating: 4,
    avatar: "https://randomuser.me/api/portraits/women/25.jpg",
  },
  {
    id: 6,
    name: "Usman Khan",
    location: "Islamabad, Pakistan",
    review: "Very easy to find specialists, love this platform!",
    rating: 5,
    avatar: "https://randomuser.me/api/portraits/men/45.jpg",
  },
];

const faqs = [
  {
    id: 1,
    question: "How do I book an appointment?",
    answer:
      "Search for your doctor by name or specialty, choose a time slot, and confirm your appointment online in seconds.",
  },
  {
    id: 2,
    question: "Can I consult online?",
    answer:
      "Yes, you can book online consultations with doctors who offer telemedicine services directly through the platform.",
  },
  {
    id: 3,
    question: "Are the doctors verified?",
    answer:
      "All doctors listed are verified professionals with valid licenses and verified credentials to ensure you get trusted care.",
  },
  {
    id: 4,
    question: "What payment methods are accepted?",
    answer:
      "We accept major credit/debit cards, mobile wallets, and selected insurance providers for your convenience.",
  },
  {
    id: 5,
    question: "Can I reschedule or cancel an appointment?",
    answer:
      "Yes, appointments can be rescheduled or canceled via your account dashboard before the scheduled time without hassle.",
  },
  {
    id: 6,
    question: "Is my personal health data secure?",
    answer:
      "Yes, we use end-to-end encryption and follow strict privacy policies to keep your health information safe and confidential.",
  },
  {
    id: 7,
    question: "Do I need to register to book an appointment?",
    answer:
      "Yes, creating an account helps manage appointments, access history, and receive reminders, but registration is free and quick.",
  },
];

const Home = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const autoplay = useRef(Autoplay({ delay: 3000, stopOnInteraction: false }));

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

  return (
    <div className="h-full max-w-7xl w-full mx-auto flex flex-col items-center px-6">
      {/* Hero Section */}
      <div className="w-full rounded-sm overflow-hidden my-2 flex flex-col md:flex-row dark:bg-muted/10 bg-card shadow-lg">
        {/* Left Content */}
        <div className="w-full md:w-1/2 px-6 flex flex-col justify-center space-y-4 order-2 md:order-1">
          <h1 className="text-3xl text-center md:text-left md:text-4xl font-bold text-chart-2">
            Find and Book the <span className="text-chart-1">Best Doctors</span>{" "}
            near you
          </h1>
          <div className="inline-flex items-center mx-auto md:mx-0 space-x-2 bg-primary px-3 py-1 rounded-md w-max">
            <span className="w-3 h-3 rounded-full bg-green-500 inline-block"></span>
            <span className="text-chart-4 font-semibold">
              50M+ patients served
            </span>
          </div>

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
        </div>

        {/* Right Image */}
        <div className="w-full md:w-1/2 flex justify-center items-center order-1 md:order-2">
          <img
            src="/img8.png"
            alt="Doctor"
            className="size-120 md:w-full object-contain"
          />
        </div>
      </div>
      {/* Doctors Section */}
      <div className="my-8">
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
      {/* Why Choose Us */}
      <div className="my-8">
        <h1 className="text-center text-primary font-semibold text-3xl">
          Why Choose Us?
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-8">
          {whyUsData.map((item, index) => (
            <div
              key={index}
              className="flex flex-col items-center text-center p-4 dark:bg-muted/10 bg-card rounded-sm shadow-lg"
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
      {/* How It Works */}
      <div className="my-8">
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
      {/* Testimonials */}
      <div className="my-8 w-full">
        <h1 className="text-center text-primary font-semibold text-3xl my-4">
          Testimonials
        </h1>

        <Carousel plugins={[autoplay.current]} className="w-full" snap="center">
          <CarouselContent className="-ml-1">
            {patientReviews.slice(0, 6).map((review) => (
              <CarouselItem
                key={review.id}
                className="basis-1/2 pl-1 lg:basis-1/3"
              >
                <div className="p-2">
                  <Card className="h-full flex flex-col items-center  p-4 bg-card dark:bg-muted/10 rounded-sm shadow-lg">
                    <Avatar className="w-16 h-16 mb-3 shadow-lg">
                      <AvatarImage
                        src="https://github.com/shadcn.png"
                        alt={review.name}
                      />
                      <AvatarFallback>{review.name[0]}</AvatarFallback>
                    </Avatar>
                    <h3 className="text-lg font-semibold text-primary">
                      {review.name}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {review.location}
                    </p>
                    <p className="text-center text-muted-foreground">
                      "{review.review}"
                    </p>
                    <div className="flex gap-1">
                      {Array.from({ length: review.rating }).map((_, i) => (
                        <span key={i} className="text-yellow-400">
                          ★
                        </span>
                      ))}
                      {Array.from({ length: 5 - review.rating }).map((_, i) => (
                        <span key={i} className="text-muted-foreground">
                          ★
                        </span>
                      ))}
                    </div>
                  </Card>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>

          <CarouselPrevious className="text-primary" />
          <CarouselNext className="text-primary" />
        </Carousel>
      </div>
      <div className="mt-8 mb-20 w-full">
        <h1 className="text-center text-primary font-semibold text-3xl my-4">
          Frequently Asked Questions
        </h1>
        <Accordion type="single" collapsible className="max-w-3xl mx-auto">
          {faqs.map((faq) => (
            <AccordionItem key={faq.id} value={faq.id.toString()}>
              <AccordionTrigger>{faq.question}</AccordionTrigger>
              <AccordionContent>{faq.answer}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </div>
  );
};

export default Home;
