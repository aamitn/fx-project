
import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Plus, Minus, ZoomIn, ZoomOut } from "lucide-react";

const InsulationPreview = () => {
  const [materialFilter, setMaterialFilter] = useState("All Materials");
  const [zoomLevel, setZoomLevel] = useState(100);

  const increaseZoom = () => {
    if (zoomLevel < 200) {
      setZoomLevel(zoomLevel + 25);
    }
  };

  const decreaseZoom = () => {
    if (zoomLevel > 50) {
      setZoomLevel(zoomLevel - 25);
    }
  };

  return (
    <div className="insulation-card">
      <div className="insulation-card-header">
        <h2>Insulation Preview</h2>
        <Button variant="ghost" size="icon" className="h-6 w-6">
          <ZoomIn className="h-5 w-5 text-gray-400" />
        </Button>
      </div>
      
      <div className="mb-4">
        <label className="block text-sm text-gray-600 mb-1">Filter Materials</label>
        <Select value={materialFilter} onValueChange={setMaterialFilter}>
          <SelectTrigger className="w-full max-w-xs">
            <SelectValue placeholder="Filter materials" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All Materials">All Materials</SelectItem>
            <SelectItem value="Base Metal">Base Metal</SelectItem>
            <SelectItem value="Insulation">Insulation</SelectItem>
            <SelectItem value="Jacket Material">Jacket Material</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="flex flex-col items-center">
        <div className="mb-2 text-center font-medium">AMBIENT</div>
        
        <div className="w-full max-w-md h-40 relative overflow-hidden rounded-lg bg-gray-100">
          {/* Temperature gradient visualization */}
          <div className="absolute inset-0 flex">
            <div className="w-1/3 bg-gradient-to-r from-red-500 to-red-400"></div>
            <div className="w-1/3 bg-gradient-to-r from-red-400 via-yellow-500 to-blue-400"></div>
            <div className="w-1/3 bg-gradient-to-r from-blue-400 to-blue-500"></div>
          </div>
          
          {/* Layer visualization */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div 
              className="w-3/4 h-20 bg-gray-200 rounded-lg border-2 border-gray-400 flex"
              style={{ transform: `scale(${zoomLevel/100})` }}
            >
              <div className="w-1/12 h-full bg-gray-400"></div>
              <div className="w-10/12 h-full bg-yellow-400"></div>
              <div className="w-1/12 h-full bg-black"></div>
            </div>
          </div>
        </div>
        
        <div className="text-xs text-gray-500 mt-2 mb-2">
          <div className="flex justify-between w-full max-w-md">
            <div>650°C</div>
            <div>50°C</div>
          </div>
        </div>
      </div>
      
      <div className="flex justify-center items-center mt-4">
        <div className="flex items-center gap-2">
          <span className="text-sm">{zoomLevel}%</span>
          <Button onClick={increaseZoom} variant="outline" size="icon" className="rounded-full h-8 w-8 p-0 bg-app-blue text-white hover:bg-app-blue-dark border-none">
            <Plus className="h-4 w-4" />
          </Button>
          <Button onClick={decreaseZoom} variant="outline" size="icon" className="rounded-full h-8 w-8 p-0 bg-app-blue text-white hover:bg-app-blue-dark border-none">
            <Minus className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default InsulationPreview;
