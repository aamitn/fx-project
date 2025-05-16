
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";

interface EnvironmentalImpactProps {
  results?: any;
}

export const EnvironmentalImpact = ({ results }: EnvironmentalImpactProps) => {
  const [fuelType, setFuelType] = useState("Natural Gas");
  const [heatContent, setHeatContent] = useState(1026);
  const [efficiency, setEfficiency] = useState(75);
  const [hoursPerYear, setHoursPerYear] = useState(8320);
  const [ambientTemp, setAmbientTemp] = useState(23.8889);
  const [processMinTemp, setProcessMinTemp] = useState(50);
  const [processMaxTemp, setProcessMaxTemp] = useState(650);
  const [windSpeed, setWindSpeed] = useState(0);

  return (
    <div className="border rounded-md p-4 mb-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h3 className="font-medium">Environmental Impact</h3>
          <span className="inline-block w-5 h-5 text-center rounded-full bg-gray-200 text-gray-600 text-xs">?</span>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
        <div>
          <label className="block text-sm text-gray-600 mb-1" htmlFor="fuelType">Fuel Type</label>
          <Select 
            defaultValue={fuelType} 
            onValueChange={setFuelType}
          >
            <SelectTrigger id="fuelType" className="w-full">
              <SelectValue placeholder="Select fuel type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Natural Gas">Natural Gas</SelectItem>
              <SelectItem value="Oil">Oil</SelectItem>
              <SelectItem value="Coal">Coal</SelectItem>
              <SelectItem value="Electricity">Electricity</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <label className="block text-sm text-gray-600 mb-1" htmlFor="heatContent">Heat Content</label>
          <div className="flex">
            <Input 
              id="heatContent" 
              type="number" 
              value={heatContent}
              onChange={(e) => setHeatContent(Number(e.target.value))}
              className="flex-1" 
            />
            <div className="ml-2 px-2 py-1 bg-gray-100 rounded flex items-center">J/m³</div>
          </div>
        </div>
        
        <div>
          <label className="block text-sm text-gray-600 mb-1" htmlFor="efficiency">Efficiency</label>
          <div className="flex">
            <Input 
              id="efficiency" 
              type="number" 
              value={efficiency}
              onChange={(e) => setEfficiency(Number(e.target.value))}
              className="flex-1" 
            />
            <div className="ml-2 px-2 py-1 bg-gray-100 rounded flex items-center">%</div>
          </div>
        </div>
        
        <div>
          <label className="block text-sm text-gray-600 mb-1" htmlFor="hoursPerYear">Hours / Year</label>
          <div className="flex">
            <Input 
              id="hoursPerYear" 
              type="number" 
              value={hoursPerYear}
              onChange={(e) => setHoursPerYear(Number(e.target.value))}
              className="flex-1" 
            />
            <div className="ml-2 px-2 py-1 bg-gray-100 rounded flex items-center">hr/yr</div>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm text-gray-600 mb-1" htmlFor="ambientTemp">Ambient Temp</label>
          <div className="flex">
            <Input 
              id="ambientTemp" 
              type="number" 
              value={ambientTemp}
              onChange={(e) => setAmbientTemp(Number(e.target.value))}
              className="flex-1" 
            />
            <div className="ml-2 px-2 py-1 bg-gray-100 rounded flex items-center">°C</div>
          </div>
        </div>
        
        <div>
          <label className="block text-sm text-gray-600 mb-1">Process Temp</label>
          <div className="flex">
            <Input 
              id="processMinTemp" 
              type="number" 
              value={processMinTemp}
              onChange={(e) => setProcessMinTemp(Number(e.target.value))}
              className="flex-1" 
            />
            <span className="mx-2 self-center">–</span>
            <Input 
              id="processMaxTemp" 
              type="number" 
              value={processMaxTemp}
              onChange={(e) => setProcessMaxTemp(Number(e.target.value))}
              className="flex-1" 
            />
            <div className="ml-2 px-2 py-1 bg-gray-100 rounded flex items-center">°C</div>
          </div>
        </div>
        
        <div>
          <label className="block text-sm text-gray-600 mb-1" htmlFor="windSpeed">Wind Speed</label>
          <div className="flex">
            <Input 
              id="windSpeed" 
              type="number" 
              value={windSpeed}
              onChange={(e) => setWindSpeed(Number(e.target.value))}
              className="flex-1" 
            />
            <div className="ml-2 px-2 py-1 bg-gray-100 rounded flex items-center">m/s</div>
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
