import React from "react";
import ContactHeroSection from "@/components/common/HeroSection.jsx";
const Contact = () => {
  return (
    <div className="h-full max-w-7xl w-full mx-auto flex flex-col items-center px-6">
      <ContactHeroSection
        Img={"img4.png"}
        firstText={"Need help with appointments"}
        secondaryText={"contact our support"}
        thirdText={"team for assistance"}
        showFilters={false}
      />
    </div>
  );
};

export default Contact;
