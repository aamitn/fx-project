
import { Input } from "@/components/ui/input";

interface EfficiencyProps {
  results?: any;
}

export const Efficiency = ({ results }: EfficiencyProps) => {
  return (
    <div className="border rounded-md p-4 mb-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h3 className="font-medium">Efficiency</h3>
          <span className="inline-block w-5 h-5 text-center rounded-full bg-gray-200 text-gray-600 text-xs">?</span>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div>
          <label className="block text-sm text-gray-600 mb-1">Annual Cost Savings</label>
          <div className="flex">
            <Input type="number" id="annualCostSavings" defaultValue={0} readOnly className="flex-1 bg-gray-50" />
            <div className="ml-2 px-2 py-1 bg-gray-100 rounded flex items-center">$/yr</div>
          </div>
        </div>
        
        <div>
          <label className="block text-sm text-gray-600 mb-1">Payback Period</label>
          <div className="flex">
            <Input type="number" id="paybackPeriod" defaultValue={0} readOnly className="flex-1 bg-gray-50" />
            <div className="ml-2 px-2 py-1 bg-gray-100 rounded flex items-center">years</div>
          </div>
        </div>
        
        <div>
          <label className="block text-sm text-gray-600 mb-1">ROI</label>
          <div className="flex">
            <Input type="number" id="roi" defaultValue={0} readOnly className="flex-1 bg-gray-50" />
            <div className="ml-2 px-2 py-1 bg-gray-100 rounded flex items-center">%</div>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm text-gray-600 mb-1">CO₂ Reduction</label>
          <div className="flex">
            <Input type="number" id="co2Reduction" defaultValue={0} readOnly className="flex-1 bg-gray-50" />
            <div className="ml-2 px-2 py-1 bg-gray-100 rounded flex items-center">tons/yr</div>
          </div>
        </div>
        
        <div>
          <label className="block text-sm text-gray-600 mb-1">Energy Savings</label>
          <div className="flex">
            <Input type="number" id="energySavings" defaultValue={0} readOnly className="flex-1 bg-gray-50" />
            <div className="ml-2 px-2 py-1 bg-gray-100 rounded flex items-center">kWh/yr</div>
          </div>
        </div>
      </div>

      {results && (
        <div className="mt-4 p-3 bg-gray-50 rounded-md border">
          <h4 className="font-medium text-sm mb-2">Calculation Results:</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {Object.entries(results).map(([key, value]) => (
              <div key={key} className="flex justify-between">
                <span className="text-sm text-gray-600">{key}:</span>
                <span className="text-sm font-medium">{String(value)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
