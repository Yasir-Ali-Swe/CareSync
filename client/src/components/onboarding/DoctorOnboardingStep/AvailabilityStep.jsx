import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

const daysOfWeek = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const AvailabilityStep = ({ currentStep }) => {
  const navigate = useNavigate();

  const handleNext = () => navigate(`/doctor-onboarding/${currentStep + 1}`);
  const handlePrevious = () =>
    navigate(`/doctor-onboarding/${currentStep - 1}`);

  // UI-only state for slots
  const [availability, setAvailability] = useState(
    daysOfWeek.map((day) => ({ day, slots: [{ start: "", end: "" }] })),
  );

  const addSlot = (dayIndex) => {
    const newAvailability = [...availability];
    newAvailability[dayIndex].slots.push({ start: "", end: "" });
    setAvailability(newAvailability);
  };

  const removeSlot = (dayIndex, slotIndex) => {
    const newAvailability = [...availability];
    newAvailability[dayIndex].slots.splice(slotIndex, 1);
    setAvailability(newAvailability);
  };

  const updateSlot = (dayIndex, slotIndex, field, value) => {
    const newAvailability = [...availability];
    newAvailability[dayIndex].slots[slotIndex][field] = value;
    setAvailability(newAvailability);
  };

  return (
    <div className="my-8 space-y-6">
      <h1 className="text-2xl font-bold">Set Your Availability</h1>

      <div className="space-y-6">
        {availability.map((dayItem, dayIndex) => (
          <div key={dayItem.day} className="border p-4 rounded-lg">
            <h2 className="font-semibold mb-2">{dayItem.day}</h2>
            <div className="space-y-2">
              {dayItem.slots.map((slot, slotIndex) => (
                <div className="flex items-center gap-2">
                  {/* Start Time */}
                  <div className="flex flex-col">
                    <Label>Start Time</Label>
                    <Input
                      type="time"
                      value={slot.start}
                      className={"rounded-sm"}
                      onChange={(e) =>
                        updateSlot(dayIndex, slotIndex, "start", e.target.value)
                      }
                    />
                  </div>

                  {/* End Time */}
                  <div className="flex flex-col">
                    <Label>End Time</Label>
                    <Input
                      type="time"
                      value={slot.end}
                      className={"rounded-sm"}
                      onChange={(e) =>
                        updateSlot(dayIndex, slotIndex, "end", e.target.value)
                      }
                    />
                  </div>

                  {/* Remove button */}
                  {dayItem.slots.length > 1 && (
                    <div className="self-end">
                      <Button
                        type="button"
                        variant="destructive"
                        className={"rounded-sm"}
                        size="sm"
                        onClick={() => removeSlot(dayIndex, slotIndex)}
                      >
                        Remove
                      </Button>
                    </div>
                  )}
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                className={"rounded-sm"}
                size="sm"
                onClick={() => addSlot(dayIndex)}
              >
                + Add Slot
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation */}
      <div className="flex justify-between pt-6">
        <Button
          type="button"
          variant="outline"
          onClick={handlePrevious}
          className={"rounded-sm"}
          disabled={currentStep === 1}
        >
          Previous
        </Button>
        <Button type="button" onClick={handleNext} disabled={currentStep === 6} className={"rounded-sm"}>
          Next
        </Button>
      </div>
    </div>
  );
};

export default AvailabilityStep;
