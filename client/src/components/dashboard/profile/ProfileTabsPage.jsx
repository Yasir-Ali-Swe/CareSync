import React from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, Loader2, AlertCircle } from "lucide-react";

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function StatusAlert({ status }) {
  if (!status) {
    return null;
  }

  const isError = status.type === "destructive";
  const Icon = isError ? AlertCircle : CheckCircle2;

  return (
    <Alert variant={isError ? "destructive" : "default"}>
      <Icon className="h-4 w-4" />
      <AlertTitle>{status.title}</AlertTitle>
      <AlertDescription>{status.message}</AlertDescription>
    </Alert>
  );
}

export default function ProfileTabsPage({ title, description, initialData, tabs = [] }) {
  const sections = tabs;
  const [profileData, setProfileData] = React.useState(() => clone(initialData));
  const [savingSection, setSavingSection] = React.useState(null);
  const [sectionStatus, setSectionStatus] = React.useState({});

  const updateSection = (sectionKey, updater) => {
    setProfileData((current) => ({
      ...current,
      [sectionKey]: typeof updater === "function" ? updater(current[sectionKey]) : updater,
    }));
  };

  const handleSubmit = async (section) => {
    const currentValues = profileData[section.value];
    const validationError = section.validate ? section.validate(currentValues, profileData) : "";

    if (validationError) {
      setSectionStatus((current) => ({
        ...current,
        [section.value]: {
          type: "destructive",
          title: "Validation required",
          message: validationError,
        },
      }));
      return;
    }

    setSavingSection(section.value);
    setSectionStatus((current) => ({
      ...current,
      [section.value]: null,
    }));

    try {
      if (section.submit) {
        await section.submit(currentValues, profileData);
      } else {
        await new Promise((resolve) => setTimeout(resolve, 850));
      }

      setSectionStatus((current) => ({
        ...current,
        [section.value]: {
          type: "default",
          title: "Saved",
          message: section.successMessage || `${section.label} updated successfully.`,
        },
      }));
    } catch (error) {
      setSectionStatus((current) => ({
        ...current,
        [section.value]: {
          type: "destructive",
          title: "Update failed",
          message: error?.message || "Unable to save changes right now.",
        },
      }));
    } finally {
      setSavingSection(null);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <h1 className="text-primary bg-card text-xl font-bold text-center w-full py-5">{title}</h1>

      <div className="w-full max-w-[90%] md:w-[75%] lg:w-[60%] xl:w-[50%] 2xl:w-[40%] mx-auto px-1 py-6 space-y-6">
        {description ? <p className="text-sm text-muted-foreground">{description}</p> : null}

        {sections.map((section) => (
          <Card key={section.value} className="border-border bg-card shadow-sm">
            <CardHeader className="space-y-1 border-b pb-4">
              <CardTitle className="text-lg">{section.label}</CardTitle>
              {section.description ? <p className="text-sm text-muted-foreground">{section.description}</p> : null}
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <form
                className="space-y-6"
                onSubmit={(event) => {
                  event.preventDefault();
                  handleSubmit(section);
                }}
              >
                {section.render({
                  values: profileData[section.value],
                  setValues: (updater) => updateSection(section.value, updater),
                  profileData,
                })}

                <StatusAlert status={sectionStatus[section.value]} />

                <div className="flex justify-end border-t pt-4">
                  <Button type="submit" disabled={savingSection === section.value}>
                    {savingSection === section.value ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      "Update"
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
