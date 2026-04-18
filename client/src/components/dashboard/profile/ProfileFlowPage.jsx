import React from "react";

const defaultWidth = "w-full max-w-[90%] md:w-[75%] lg:w-[60%] xl:w-[50%] 2xl:w-[40%] mx-auto";

const clone = (value) => JSON.parse(JSON.stringify(value));

const ProfileFlowPage = ({ title, steps, totalSteps, initialProfile }) => {
  const [currentStep, setCurrentStep] = React.useState(1);
  const [profile, setProfile] = React.useState(() => clone(initialProfile));
  const [loading, setLoading] = React.useState(false);
  const [status, setStatus] = React.useState(null);

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
