// Calculations.tsx
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Tabs } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { CalculationTypeButtons } from "./calculations/CalculationTypeButtons";
import { CalculationTabs } from "./calculations/CalculationTabs";
import { getToastMessage } from "./calculations/CalculationUtils";
import { sendCalculation } from "@/utils/api";
import { useInsulation } from "@/contexts/InsulationContext";

// Define the props interface for Calculations
interface CalculationsProps {
  selectedTabs: string[];
  // MODIFIED: Type setSelectedTabs to accept a functional updater or a direct array
  setSelectedTabs: (updater: string[] | ((prevTabs: string[]) => string[])) => void;
  calculationResults: Record<string, any>;
  // MODIFIED: Type setCalculationResults to accept a functional updater or a direct object
  setCalculationResults: (updater: Record<string, any> | ((prevResults: Record<string, any>) => Record<string, any>)) => void;
}

const Calculations: React.FC<CalculationsProps> = ({
  selectedTabs,
  setSelectedTabs,
  calculationResults,
  setCalculationResults,
}) => {
  const [isCalculating, setIsCalculating] = useState(false);
  const { toast } = useToast();
  const { layers } = useInsulation();

  const toggleTab = (value: string) => {
    setSelectedTabs((prevSelectedTabs) => { // This is the functional update that was causing the error
      let newTabs;
      if (prevSelectedTabs.includes(value)) {
        newTabs = prevSelectedTabs.filter((tab) => tab !== value);
        // Clear results for this tab when it's deselected
        setCalculationResults((prevResults) => { // This is also a functional update
          const newResults = { ...prevResults };
          delete newResults[value];
          return newResults;
        });
      } else {
        newTabs = [...prevSelectedTabs, value];
        toast({
          title: "Calculation Added",
          description: getToastMessage(value),
        });
      }
      return newTabs;
    });
  };

  const collectFormData = (): Record<string, any> => {
    const formData: Record<string, any> = {};

    selectedTabs.forEach((tab) => {
      const tabElement = document.querySelector(`[data-tab='${tab}']`);
      if (!tabElement) return;

      const inputs = tabElement.querySelectorAll('input, select, textarea');

      const tabData: Record<string, any> = {};

      inputs.forEach((input) => {
        if (input.id) {
          let value: any;
          if (input instanceof HTMLInputElement) {
            value =
              input.type === 'number'
                ? Number(input.value)
                : input.type === 'checkbox'
                ? input.checked
                : input.value;
          } else if (input instanceof HTMLSelectElement) {
            value = input.value;
          } else if (input instanceof HTMLTextAreaElement) {
            value = input.value;
          } else {
            value = (input as any).value;
          }
          tabData[input.id] = value;
        }
      });

      if (tab === 'heat-loss') {
        const formattedLayers = Array.isArray(layers)
          ? layers.map((layer) => ({
              materialName: layer.name,
              thickness: Number(layer.thickness),
            }))
          : [];
        tabData.layers = formattedLayers;
      }

      formData[tab] = tabData;
    });

    console.log("Collected form data:", formData);
    return formData;
  };

  const handleCalculate = async () => {
    try {
      setIsCalculating(true);
      const allFormData = collectFormData();

      const results: Record<string, any> = {};

      await Promise.all(
        selectedTabs.map(async (tab) => {
          try {
            const result = await sendCalculation(tab, allFormData[tab] || {});
            results[tab] = result;
          } catch (error) {
            console.error(`Error calculating ${tab}:`, error);
            toast({
              title: "Calculation Error",
              description: `Failed to calculate ${tab}. Please try again.`,
              variant: "destructive",
            });
          }
        })
      );

      setCalculationResults(results); // This is a direct update, which is fine

      toast({
        title: "Calculation Complete",
        description: "All selected calculations have been processed",
      });
    } catch (error) {
      console.error("Calculation error:", error);
      toast({
        title: "Calculation Error",
        description: "Failed to process calculations. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCalculating(false);
    }
  };

  return (
    <div className="insulation-card">
      <div className="insulation-card-header">
        <h2>Calculations</h2>
      </div>

      <CalculationTypeButtons selectedTabs={selectedTabs} toggleTab={toggleTab} />

      <div>
        <Tabs defaultValue="heat-quantity">
          <CalculationTabs
            selectedTabs={selectedTabs}
            calculationResults={calculationResults}
          />
        </Tabs>
      </div>

      <div className="flex justify-end mt-4">
        <Button
          className="bg-app-blue hover:bg-app-blue-dark"
          onClick={handleCalculate}
          disabled={isCalculating || selectedTabs.length === 0}
        >
          {isCalculating ? "CALCULATING..." : "CALCULATE"}
        </Button>
      </div>
    </div>
  );
};

export default Calculations;