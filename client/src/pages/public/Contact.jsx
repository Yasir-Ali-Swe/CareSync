import React from "react";
import { useState } from "react";
import ContactHeroSection from "@/components/common/HeroSection.jsx";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission logic here
    console.log(formData);
  };

  return (
    <div className="h-full max-w-7xl w-full mx-auto flex flex-col items-center px-6">
      <ContactHeroSection
        Img={"img4.png"}
        firstText={"Need help with appointments"}
        secondaryText={"contact our support"}
        thirdText={"team for assistance"}
        showFilters={false}
      />
      <h1 className="my-8 text-3xl font-black w-full text-center">Contact Us</h1>
      <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="hidden lg:flex flex-col justify-start  mb-8 gap-2 p-4 bg-card rounded-xl shadow-md border">
          <h2 className="text-2xl font-bold text-primary">
            Support Information
          </h2>

          <p className="text-muted-foreground">
            Our support team is here to help patients and doctors with any
            questions about appointments, consultations, or platform usage.
          </p>

          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-lg">Email</h3>
              <p className="text-muted-foreground">caresync@gmail.com</p>
            </div>

            <div>
              <h3 className="font-semibold text-lg">Phone</h3>
              <p className="text-muted-foreground">+92 330 1766870</p>
            </div>

            <div>
              <h3 className="font-semibold text-lg">Office Location</h3>
              <p className="text-muted-foreground">
                Faisalabad, Punjab, Pakistan
              </p>
            </div>

            

            <div>
              <h3 className="font-semibold text-lg">Response Time</h3>
              <p className="text-muted-foreground">
                We usually respond within 24 hours.
              </p>
            </div>
          </div>
        </div>
        <div className="mb-8 p-4 bg-card rounded-xl shadow-md border">
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div className="flex flex-col justify-center gap-2">
                <Label htmlFor="name" className={"text-xl font-semibold "}>
                  Name
                </Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="Your name"
                  className={"rounded-2xl w-full "}
                  value={formData.name}
                  onChange={handleChange}
                />
              </div>
              <div className="flex flex-col justify-center gap-2">
                <Label htmlFor="email" className={"text-xl font-semibold "}>
                  Email
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Your email"
                  className={"rounded-2xl "}
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
              <div className="flex flex-col justify-center gap-2">
                <Label htmlFor="subject" className={"text-xl font-semibold "}>
                  Subject
                </Label>
                <Input
                  id="subject"
                  name="subject"
                  placeholder="Subject"
                  value={formData.subject}
                  onChange={handleChange}
                  className={"rounded-2xl "}
                />
              </div>
              <div className="flex flex-col justify-center gap-2">
                <Label htmlFor="message" className={"text-xl font-semibold "}>
                  Message
                </Label>
                <Textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Your message"
                  className={"rounded-2xl "}
                />
              </div>
              <Button type="submit" className={"rounded-2xl font-semibold"}>
                Send Message
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Contact;
