import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { CalculationTypeButtons } from "./calculations/CalculationTypeButtons";
import { CalculationTabs } from "./calculations/CalculationTabs";
import { getToastMessage } from "./calculations/CalculationUtils";
import { sendCalculation } from "@/utils/api";

const Calculations = () => {
  const [selectedTabs, setSelectedTabs] = useState(["heat-quantity"]);
  const [isCalculating, setIsCalculating] = useState(false);
  const [calculationResults, setCalculationResults] = useState<Record<string, any>>({});
  const { toast } = useToast();
  
  const toggleTab = (value: string) => {
    if (selectedTabs.includes(value)) {
      setSelectedTabs(selectedTabs.filter(tab => tab !== value));
      // Clear results for this tab when it's deselected
      setCalculationResults(prev => {
        const newResults = {...prev};
        delete newResults[value];
        return newResults;
      });
    } else {
      setSelectedTabs([...selectedTabs, value]);
      
      // Show toast notification when a calculation type is selected
      toast({
        title: "Calculation Added",
        description: getToastMessage(value),
      });
    }
  };

  // Function to collect all form data from the calculation components
  const collectFormData = (): Record<string, any> => {
    // Get all form elements from the calculation tabs
    const formData: Record<string, any> = {};
    
    selectedTabs.forEach(tab => {
      const tabElement = document.querySelector(`[data-tab="${tab}"]`);
      if (!tabElement) return;
      
      const inputs = tabElement.querySelectorAll('input');
      
      const tabData: Record<string, any> = {};
      
      inputs.forEach(input => {
        if (input.id) {
          tabData[input.id] = input.type === 'number' ? Number(input.value) : input.value;
        }
      });
      
      formData[tab] = tabData;
    });
    
    console.log("Collected form data:", formData);
    return formData;
  };

  const handleCalculate = async () => {
    try {
      setIsCalculating(true);
      const allFormData = collectFormData();
      
      // Process each selected calculation tab
      const results: Record<string, any> = {};
      
      // Use Promise.all to run all calculations in parallel
      await Promise.all(selectedTabs.map(async (tab) => {
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
      }));
      
      setCalculationResults(results);
      
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