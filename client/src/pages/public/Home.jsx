import React from "react";
import HomeHeroSection from "@/components/common/HeroSection.jsx";
import SpecilizedDoctors from "@/components/common/SpecilizedDoctors.jsx";
import WhyChooseUs from "@/components/common/WhyChooseUs.jsx";
import HowItsWork from "@/components/common/HowItsWork.jsx";
import Testimonials from "@/components/common/Testimonials.jsx";
import Faqs from "@/components/common/Faqs.jsx";

const Home = () => {
  return (
    <div className="h-full max-w-7xl w-full mx-auto flex flex-col items-center px-6">
      <HomeHeroSection />
      <SpecilizedDoctors />
      <WhyChooseUs />
      <HowItsWork />
      <Testimonials />
      <Faqs />
    </div>
  );
};

export default Home;
