
import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { HelpCircle } from "lucide-react";

const InsulationDetails = () => {
  const [systemApplication, setSystemApplication] = useState("Tank Shell - Horizontal");
  const [dimensionalConstruction, setDimensionalConstruction] = useState("Even Increment");
  const [thickness, setThickness] = useState("0");

  return (
    <div className="insulation-card">
      <div className="insulation-card-header">
        <h2>Insulation Details</h2>
        <HelpCircle className="w-5 h-5 text-gray-400" />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm text-gray-600 mb-1">System Application</label>
          <Select value={systemApplication} onValueChange={setSystemApplication}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select system application" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Tank Shell - Horizontal">Tank Shell - Horizontal</SelectItem>
              <SelectItem value="Tank Shell - Vertical">Tank Shell - Vertical</SelectItem>
              <SelectItem value="Pipe">Pipe</SelectItem>
              <SelectItem value="Equipment">Equipment</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <label className="block text-sm text-gray-600 mb-1">Dimensional Construction</label>
          <Select value={dimensionalConstruction} onValueChange={setDimensionalConstruction}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select dimensional construction" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Even Increment">Even Increment</SelectItem>
              <SelectItem value="Odd Increment">Odd Increment</SelectItem>
              <SelectItem value="Custom">Custom</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <label className="block text-sm text-gray-600 mb-1">Thickness (mm)</label>
          <div className="input-group">
            <Input 
              type="number" 
              value={thickness}
              onChange={(e) => setThickness(e.target.value)}
              className="input"
            />
            <span className="unit">mm</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InsulationDetails;
