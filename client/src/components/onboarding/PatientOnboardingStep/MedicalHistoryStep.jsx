import React from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxValue,
} from "@/components/ui/combobox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const chronicConditions = [
  "Diabetes",
  "Hypertension",
  "Asthma",
  "Chronic Obstructive Pulmonary Disease (COPD)",
  "Heart Disease",
  "Chronic Kidney Disease",
  "Arthritis",
  "Osteoporosis",
  "Depression",
  "Anxiety",
  "Cancer",
  "Thyroid Disorders",
  "Stroke",
  "Obesity",
  "Alzheimer's Disease",
  "Parkinson's Disease",
  "Epilepsy",
  "HIV/AIDS",
  "Autoimmune Disorders",
  "Migraine",
  "Other Chronic Conditions",
];
const allergies = [
  "Peanuts",
  "Tree Nuts (Almonds, Walnuts, Cashews)",
  "Milk",
  "Eggs",
  "Wheat/Gluten",
  "Soy",
  "Fish",
  "Shellfish",
  "Pollen",
  "Dust Mites",
  "Pet Dander (Cats, Dogs)",
  "Mold",
  "Latex",
  "Insect Stings (Bees, Wasps)",
  "Perfume/Fragrance",
  "Medication (Penicillin, Aspirin, etc.)",
  "Nickel/Metals",
  "Food Additives (Sulfites, MSG)",
  "Cockroach Droppings",
  "Other Environmental Allergens",
];
const MedicalHistoryStep = ({ currentStep }) => {
  const navigate = useNavigate();
  const [allergyValue, setAllergyValue] = useState([]);
  const [conditionValue, setConditionValue] = useState([]);

  const handleNext = () => {
    navigate(`/patient-onboarding/${currentStep + 1}`);
  };

  const handlePrevious = () => {
    navigate(`/patient-onboarding/${currentStep - 1}`);
  };

  return (
    <div className="my-8 space-y-6">
      <h1 className="text-2xl font-bold">Medical Information</h1>

      <form className="space-y-5">
        {/* Height */}
        <div className="space-y-2">
          <Label htmlFor="height">Height (cm)</Label>
          <Input
            id="height"
            type="number"
            placeholder="Enter your height"
            className={"rounded-sm"}
          />
        </div>

        {/* Weight */}
        <div className="space-y-2">
          <Label htmlFor="weight">Weight (kg)</Label>
          <Input
            id="weight"
            type="number"
            placeholder="Enter your weight"
            className={"rounded-sm"}
          />
        </div>

        {/* Blood Group */}
        <div className="space-y-2">
          <Label htmlFor="bloodGroup">Blood Group</Label>
          <Select>
            <SelectTrigger className={"rounded-sm"}>
              <SelectValue placeholder="Select blood group" />
            </SelectTrigger>
            <SelectContent className={"rounded-sm"}>
              <SelectGroup>
                <SelectLabel>Blood Group</SelectLabel>
                <SelectItem value="A+">A+</SelectItem>
                <SelectItem value="A-">A-</SelectItem>
                <SelectItem value="B+">B+</SelectItem>
                <SelectItem value="B-">B-</SelectItem>
                <SelectItem value="AB+">AB+</SelectItem>
                <SelectItem value="AB-">AB-</SelectItem>
                <SelectItem value="O+">O+</SelectItem>
                <SelectItem value="O-">O-</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="allergies">Allergies (E.g., Peanuts, Pollen)</Label>
          <Combobox
            items={allergies}
            multiple
            value={allergyValue}
            onValueChange={setAllergyValue}
            className="rounded-sm w-full"
          >
            <ComboboxChips>
              <ComboboxValue>
                {allergyValue.map((item) => (
                  <ComboboxChip key={item}>{item}</ComboboxChip>
                ))}
              </ComboboxValue>
              <ComboboxChipsInput placeholder="Add Allergies" />
            </ComboboxChips>
            <ComboboxContent
              align="start"
              position="popper"
              className="min-w-full w-full mt-1"
            >
              <ComboboxEmpty>No items found.</ComboboxEmpty>
              <ComboboxList>
                {(item) => (
                  <ComboboxItem key={item} value={item}>
                    {item}
                  </ComboboxItem>
                )}
              </ComboboxList>
            </ComboboxContent>
          </Combobox>
        </div>

        <div className="space-y-2 w-full">
          <Label htmlFor="chronicConditions">
            Chronic Conditions (E.g., Diabetes, Hypertension)
          </Label>
          <Combobox
            items={chronicConditions}
            multiple
            value={conditionValue}
            onValueChange={setConditionValue}
            className="rounded-sm w-full"
          >
            <ComboboxChips>
              <ComboboxValue>
                {conditionValue.map((item) => (
                  <ComboboxChip key={item}>{item}</ComboboxChip>
                ))}
              </ComboboxValue>
              <ComboboxChipsInput placeholder="Add Chronic Conditions" />
            </ComboboxChips>
            <ComboboxContent
              align="start"
              position="popper"
              className="min-w-full w-full mt-1"
            >
              <ComboboxEmpty>No items found.</ComboboxEmpty>
              <ComboboxList>
                {(item) => (
                  <ComboboxItem key={item} value={item}>
                    {item}
                  </ComboboxItem>
                )}
              </ComboboxList>
            </ComboboxContent>
          </Combobox>
        </div>

        <div className="flex justify-between pt-6 ">
          <Button
            type="button"
            variant="outline"
            className={"rounded-sm"}
            onClick={handlePrevious}
            disabled={currentStep === 1}
          >
            Previous
          </Button>

          <Button
            type="button"
            onClick={handleNext}
            className={"rounded-sm"}
            disabled={currentStep === 4}
          >
            Next
          </Button>
        </div>
      </form>
    </div>
  );
};

export default MedicalHistoryStep;
