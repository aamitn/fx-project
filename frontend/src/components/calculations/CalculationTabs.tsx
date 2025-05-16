
import { TabsContent } from "@/components/ui/tabs";
import { PersonnelProtection } from "./PersonnelProtection";
import { CondensationControl } from "./CondensationControl";
import { EnvironmentalImpact } from "./EnvironmentalImpact";
import { Efficiency } from "./Efficiency";
import { HeatQuantity } from "./HeatQuantity"; 


interface CalculationTabsProps {
  selectedTabs: string[];
  calculationResults?: Record<string, any>;
}

export const CalculationTabs = ({ 
  selectedTabs, 
  calculationResults = {} 
}: CalculationTabsProps) => {
  return (
    <div className="mt-4">
      {selectedTabs.includes("personnel-protection") && (
        <TabsContent value="personnel-protection" className="mt-0" forceMount>
          <div data-tab="personnel-protection">
            <PersonnelProtection results={calculationResults["personnel-protection"]} />
          </div>
        </TabsContent>
      )}
      
      {selectedTabs.includes("condensation-control") && (
        <TabsContent value="condensation-control" className="mt-0" forceMount>
          <div data-tab="condensation-control">
            <CondensationControl results={calculationResults["condensation-control"]} />
          </div>
        </TabsContent>
      )}
      
      {selectedTabs.includes("environmental-impact") && (
        <TabsContent value="environmental-impact" className="mt-0" forceMount>
          <div data-tab="environmental-impact">
            <EnvironmentalImpact results={calculationResults["environmental-impact"]} />
          </div>
        </TabsContent>
      )}
      
      {selectedTabs.includes("efficiency") && (
        <TabsContent value="efficiency" className="mt-0" forceMount>
          <div data-tab="efficiency">
            <Efficiency results={calculationResults["efficiency"]} />
          </div>
        </TabsContent>
      )}

      {selectedTabs.includes("heat-quantity") && (
        <TabsContent value="heat-quantity" className="mt-0" forceMount>
          <div data-tab="heat-quantity">
            <HeatQuantity results={calculationResults["heat-quantity"]} />
          </div>
        </TabsContent>
      )}
      
    </div>
  );
};
