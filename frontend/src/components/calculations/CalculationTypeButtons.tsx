
import { Button } from "@/components/ui/button";

type CalculationType = {
  id: string;
  label: string;
};

interface CalculationTypeButtonsProps {
  selectedTabs: string[];
  toggleTab: (value: string) => void;
}

const calculationTypes: CalculationType[] = [
  { id: "personnel-protection", label: "Personnel Protection" },
  { id: "condensation-control", label: "Condensation Control" },
  { id: "environmental-impact", label: "Environmental Impact" },
  { id: "efficiency", label: "Efficiency" },
  { id: "heat-quantity", label: "Heat Quantity" }
];

export const CalculationTypeButtons = ({
  selectedTabs,
  toggleTab
}: CalculationTypeButtonsProps) => {
  return (
    <div className="mb-4">
      <h3 className="text-sm text-gray-600 mb-2">Calculation Types</h3>
      <div className="flex flex-wrap gap-2">
        {calculationTypes.map(type => (
          <Button
            key={type.id}
            variant={selectedTabs.includes(type.id) ? "default" : "outline"}
            size="sm"
            className={selectedTabs.includes(type.id) ? "bg-app-blue text-white" : "text-gray-600"}
            onClick={() => toggleTab(type.id)}
          >
            {type.label}
          </Button>
        ))}
      </div>
    </div>
  );
};
