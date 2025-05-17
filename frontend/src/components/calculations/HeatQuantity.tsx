import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { fetchMaterialOptions } from "@/utils/api"; // Import the utility function

interface HeatQuantityProps {
  results?: any;
}

export const HeatQuantity = ({ results }: HeatQuantityProps) => {
  const [mass, setMass] = useState<number | undefined>();
  const [initialTemperature, setInitialTemperature] = useState<number | undefined>();
  const [finalTemperature, setFinalTemperature] = useState<number | undefined>();
  const [materialType, setMaterialType] = useState<string>("");
  const [materialOptions, setMaterialOptions] = useState<string[]>([]);

  useEffect(() => {
    const getMaterialOptions = async () => {
      const options = await fetchMaterialOptions();
      setMaterialOptions(options);
    };

    getMaterialOptions();
  }, []);

  return (
    <div className="border rounded-md p-4 mb-4">
      <h3 className="font-medium mb-4">Heat Quantity Calculation</h3>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
        <div>
          <label htmlFor="mass" className="block text-sm text-gray-600 mb-1">Mass</label>
          <div className="flex">
            <Input
              type="number"
              id="mass"
              value={mass}
              onChange={(e) => setMass(parseFloat(e.target.value))}
              className="flex-1"
            />
            <div className="ml-2 px-2 py-1 bg-gray-100 rounded flex items-center">g</div> {/* unit */}
          </div>
        </div>
        
        <div>
          <label htmlFor="initialTemperature" className="block text-sm text-gray-600 mb-1">Initial Temperature</label>
          <div className="flex">
            <Input
              type="number"
              id="initialTemperature"
              value={initialTemperature}
              onChange={(e) => setInitialTemperature(parseFloat(e.target.value))}
              className="flex-1"
            />
            <div className="ml-2 px-2 py-1 bg-gray-100 rounded flex items-center">°C</div> {/*  unit */}
          </div>
        </div>
        
        <div>
          <label htmlFor="finalTemperature" className="block text-sm text-gray-600 mb-1">Final Temperature</label>
          <div className="flex">
            <Input
              type="number"
              id="finalTemperature"
              value={finalTemperature}
              onChange={(e) => setFinalTemperature(parseFloat(e.target.value))}
              className="flex-1"
            />
            <div className="ml-2 px-2 py-1 bg-gray-100 rounded flex items-center">°C</div> {/*  unit */}
          </div>
        </div>

        <div>
          <label htmlFor="materialType" className="block text-sm text-gray-600 mb-1">Material Type</label>
          <Select value={materialType} onValueChange={setMaterialType}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select material" />
            </SelectTrigger>
            <SelectContent>
              {materialOptions.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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