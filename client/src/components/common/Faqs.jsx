import React from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
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
const Faqs = () => {
  return (
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
  );
};

export default Faqs;
