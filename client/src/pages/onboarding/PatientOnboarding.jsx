import React from "react";
import { useParams } from "react-router-dom";
import { Check, User, Phone, Stethoscope, Ambulance } from "lucide-react";

import PersonalInfoStep from "@/components/onboarding/PatientOnboardingStep/PersonalInfoStep";
import ContactInfoStep from "@/components/onboarding/PatientOnboardingStep/ContactInfoStep";
import MedicalHistoryStep from "@/components/onboarding/PatientOnboardingStep/MedicalHistoryStep";
import EmergencyContactStep from "@/components/onboarding/PatientOnboardingStep/EmergencyContactStep";

const PatientOnboarding = () => {
  const { step } = useParams();
  const currentStep = Number(step) || 1;

  const steps = [1, 2, 3, 4];

  const progressPercentage = ((currentStep - 1) / (steps.length - 1)) * 100;

  const stepComponents = {
    1: <PersonalInfoStep currentStep={currentStep} />,
    2: <ContactInfoStep currentStep={currentStep} />,
    3: <MedicalHistoryStep currentStep={currentStep} />,
    4: <EmergencyContactStep currentStep={currentStep} />,
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <h1 className="text-primary text-xl font-bold text-center w-full py-5 bg-card border-b-2 border-border shadow-sm">
        Complete your profile to continue
      </h1>

      {/* Step Indicator */}
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
                      : "bg-muted text-muted-foreground border-border"
                }`}
              >
                {isCompleted ? (
                  <Check className="w-5 h-5 " />
                ) : s == 1 ? (
                  <User
                    className={`w-5 h-5 ${isActive ? "text-background" : "text-primary"}`}
                  />
                ) : s == 2 ? (
                  <Phone
                    className={`w-5 h-5 ${isActive ? "text-background" : "text-primary"}`}
                  />
                ) : s == 3 ? (
                  <Stethoscope
                    className={`w-5 h-5 ${isActive ? "text-background" : "text-primary"}`}
                  />
                ) : (
                  <Ambulance
                    className={`w-5 h-5 ${isActive ? "text-background" : "text-primary"}`}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Step Content */}
      <div className="flex-1 w-full max-w-[90%] md:w-[75%] lg:w-[60%] xl:w-[50%] 2xl:w-[40%] mx-auto mt-1">
        {stepComponents[currentStep] || (
          <PersonalInfoStep currentStep={currentStep} />
        )}
      </div>
    </div>
  );
};

export default PatientOnboarding;
