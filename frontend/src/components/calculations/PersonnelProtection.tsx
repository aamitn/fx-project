
import { Input } from "@/components/ui/input";
import { useState } from "react";

interface PersonnelProtectionProps {
  results?: any;
}

export const PersonnelProtection = ({ results }: PersonnelProtectionProps) => {
  const [maxSurfaceTemp, setMaxSurfaceTemp] = useState(60);
  const [processMinTemp, setProcessMinTemp] = useState(50);
  const [processMaxTemp, setProcessMaxTemp] = useState(650);
  const [ambientTemp, setAmbientTemp] = useState(23.8889);
  const [windSpeed, setWindSpeed] = useState(0);

  return (
    <div className="border rounded-md p-4 mb-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h3 className="font-medium">Personnel Protection</h3>
          <span className="inline-block w-5 h-5 text-center rounded-full bg-gray-200 text-gray-600 text-xs">?</span>
        </div>
        <div className="flex items-center gap-2">
          <button className="text-gray-400 hover:text-gray-600">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
            </svg>
           <span className="text-sm text-gray-600">Thickness Table</span>
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm text-gray-600 mb-1" htmlFor="maxSurfaceTemp">Max Surface Temp</label>
          <div className="flex">
            <Input 
              id="maxSurfaceTemp" 
              type="number" 
              value={maxSurfaceTemp}
              onChange={(e) => setMaxSurfaceTemp(Number(e.target.value))}
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
