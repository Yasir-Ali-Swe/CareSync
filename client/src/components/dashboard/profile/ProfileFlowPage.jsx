import React from "react";
import { useSelector } from "react-redux";
import { doctorApi } from "@/services/doctor.api";
import { patientApi } from "@/services/patient.api";

const defaultWidth = "w-full max-w-[90%] md:w-[75%] lg:w-[60%] xl:w-[50%] 2xl:w-[40%] mx-auto";

const clone = (value) => JSON.parse(JSON.stringify(value));

const ProfileFlowPage = ({ title, steps, totalSteps, initialProfile }) => {
  const { user } = useSelector((state) => state.auth);
  const [currentStep, setCurrentStep] = React.useState(1);
  const [profile, setProfile] = React.useState(() => clone(initialProfile));
  const [loading, setLoading] = React.useState(true);
  const [status, setStatus] = React.useState(null);

  // Fetch real profile data on mount
  React.useEffect(() => {
    const fetchProfileData = async () => {
      try {
        if (user?.role === "doctor") {
          const response = await doctorApi.getDoctorProfile();
          if (response.success && response.data?.profile) {
            setProfile(response.data.profile);
          }
        } else if (user?.role === "patient") {
          const response = await patientApi.getPatientProfile();
          if (response.success && response.data?.profile) {
            setProfile(response.data.profile);
          }
        }
      } catch (error) {
        console.error("Failed to fetch profile:", error);
        // Keep initialProfile as fallback
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [user?.role]);

  const progressPercentage = ((currentStep - 1) / (totalSteps - 1 || 1)) * 100;

  const stepConfig = steps[currentStep - 1];
  const StepComponent = stepConfig?.component;

  const handleUpdate = async () => {
    const validationError = stepConfig?.validate ? stepConfig.validate(profile[stepConfig.key], profile) : "";

    if (validationError) {
      setStatus({ type: "error", message: validationError });
      return;
    }

    setLoading(true);
    setStatus(null);

    try {
      await new Promise((resolve) => setTimeout(resolve, 850));
      setStatus({ type: "success", message: `${stepConfig.label} updated successfully.` });
    } catch (error) {
      setStatus({ type: "error", message: error?.message || "Unable to update right now." });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {title ? (
        <h1 className="text-primary bg-card text-xl font-bold text-center w-full py-5">
          {title}
        </h1>
      ) : null}

      <div className={`${defaultWidth} px-1 py-4`}>
        <div className="relative flex justify-between items-center">
          <div className="absolute top-1/2 left-0 right-0 h-1 bg-border -translate-y-1/2 z-0" />
          <div
            className="absolute top-1/2 left-0 h-1 bg-primary -translate-y-1/2 z-0 transition-all duration-300"
            style={{ width: `${progressPercentage}%` }}
          />

          {steps.map((step) => {
            const isCompleted = currentStep > step.index;
            const isActive = currentStep === step.index;
            const Icon = step.icon;

            return (
              <div
                key={step.index}
                className={`w-8 h-8 lg:w-10 lg:h-10 flex items-center justify-center rounded-full border-2 font-semibold z-10 transition-all duration-300 ${
                  isCompleted || isActive
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-muted text-muted-foreground border-border"
                }`}
              >
                <Icon
                  className={`w-5 h-5 ${isCompleted || isActive ? "text-primary-foreground" : "text-primary"}`}
                />
              </div>
            );
          })}
        </div>

        <div className="mt-8 space-y-2">
          <h2 className="text-3xl font-bold text-foreground">Profile Settings</h2>
          <p className="text-muted-foreground">
            Make sure your profile information is accurate and current.
          </p>
        </div>
      </div>

      <div className={`flex-1 ${defaultWidth} -mt-6`}>
        {StepComponent ? (
          <StepComponent
            profile={profile}
            setProfile={setProfile}
            currentStep={currentStep}
            totalSteps={totalSteps}
            onPrevious={() => setCurrentStep((step) => Math.max(1, step - 1))}
            onNext={() => setCurrentStep((step) => Math.min(totalSteps, step + 1))}
            onUpdate={handleUpdate}
            loading={loading}
            status={status}
          />
        ) : null}
      </div>
    </div>
  );
};

export default ProfileFlowPage;
