import React from "react";
import { useParams } from "react-router-dom";
import { Check } from "lucide-react";
import PersonalInfoStep from "@/components/onboarding/DoctorOnboardingStep/PersonalInfoStep";
import DoctorEducationStep from "@/components/onboarding/DoctorOnboardingStep/EducationStep";
import ClinicDetailsStep from "@/components/onboarding/DoctorOnboardingStep/ClinicDetailsStep";
import ProfessionalInfoStep from "@/components/onboarding/DoctorOnboardingStep/ProfessionalDetailsStep";
import AvailabilityStep from "@/components/onboarding/DoctorOnboardingStep/AvailabilityStep";
import BioStep from "@/components/onboarding/DoctorOnboardingStep/BioStep";

const DoctorOnboarding = () => {
  const { step } = useParams();
  const currentStep = Number(step) || 1;

  const steps = [1, 2, 3, 4, 5, 6];

  const progressPercentage = ((currentStep - 1) / (steps.length - 1)) * 100;

  const stepComponents = {
    1: <PersonalInfoStep currentStep={currentStep} />,
    2: <DoctorEducationStep currentStep={currentStep} />,
    3: <ClinicDetailsStep currentStep={currentStep} />,
    4: <ProfessionalInfoStep currentStep={currentStep} />,
    5: <BioStep currentStep={currentStep} />,
    6: <AvailabilityStep currentStep={currentStep} />,
  };
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <h1 className="text-primary bg-card text-xl font-bold text-center w-full py-5">
        Complete your profile to continue
      </h1>
      <div className="w-full max-w-[90%] md:w-[75%] lg:w-[60%] xl:w-[50%] 2xl:w-[40%] mx-auto px-1 py-4">
        <div className="relative flex justify-between items-center">
          {/* Background Line */}
          <div className="absolute top-1/2 left-0 right-0 h-1 bg-border -translate-y-1/2 z-0" />

          {/* Progress Line */}
          <div
            className="absolute top-1/2 left-0 h-1 bg-primary -translate-y-1/2 z-0 transition-all duration-300"
            style={{ width: `${progressPercentage}%` }}
          />

          {/* Steps */}
          {steps.map((s) => {
            const isCompleted = currentStep > s;
            const isActive = currentStep === s;

            return (
              <div
                key={s}
                className={`w-8 h-8 lg:w-10 lg:h-10 flex items-center justify-center rounded-full border-2 font-semibold z-10 transition-all duration-300
                ${
                  isCompleted
                    ? "bg-primary text-primary-foreground border-primary"
                    : isActive
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-card text-muted-foreground border-border"
                }`}
              >
                {isCompleted ? <Check className="w-5 h-5" /> : s}
              </div>
            );
          })}
        </div>
      </div>
      <div className="flex-1 w-full max-w-[90%] md:w-[75%] lg:w-[60%] xl:w-[50%] 2xl:w-[40%] mx-auto mt-1">
        {stepComponents[currentStep] || (
          <PersonalInfoStep currentStep={currentStep} />
        )}
      </div>
    </div>
  );
};

export default DoctorOnboarding;
