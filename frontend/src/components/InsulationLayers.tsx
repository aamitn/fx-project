
import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { PlusIcon, X as XIcon } from "lucide-react";

type InsulationLayer = {
  id: string;
  type: string;
  name: string;
  thickness: string;
  color: string;
};

const InsulationLayers = () => {
  const [layers, setLayers] = useState<InsulationLayer[]>([
    { id: "1", type: "Base Metal", name: "PVC", thickness: "", color: "bg-gray-400" },
    { id: "2", type: "Insulation 1", name: "Phenolic Type III, C1126-13", thickness: "Varied", color: "bg-yellow-400" },
    { id: "3", type: "Jacket Material", name: "0.9 – All Service Jacket", thickness: "", color: "bg-black" },
  ]);

  const materialOptions = {
    "Base Metal": ["PVC", "Steel", "Aluminum", "Copper"],
    "Insulation 1": ["Phenolic Type III, C1126-13", "Fiberglass", "Mineral Wool", "Polyurethane"],
    "Insulation 2": ["Fiberglass", "Mineral Wool", "Polyurethane", "Ceramic Fiber"],
    "Insulation 3": ["Fiberglass", "Mineral Wool", "Polyurethane", "Ceramic Fiber"],
    "Jacket Material": ["0.9 – All Service Jacket", "Aluminum", "Stainless Steel", "PVC"],
  };

  const addLayer = () => {
    const insulationLayers = layers.filter(layer => layer.type.includes("Insulation")).length;
    const newLayer = {
      id: Date.now().toString(),
      type: `Insulation ${insulationLayers + 1}`,
      name: "Select Material",
      thickness: "",
      color: "bg-orange-300",
    };
    // Insert before the last item (jacket)
    const newLayers = [...layers];
    newLayers.splice(layers.length - 1, 0, newLayer);
    setLayers(newLayers);
  };

  const removeLayer = (id: string) => {
    const newLayers = layers.filter(layer => layer.id !== id);
    
    // Rename insulation layers to maintain sequential numbering
    const updatedLayers = newLayers.map((layer, index) => {
      if (layer.type.includes("Insulation")) {
        const insulationIndex = newLayers.slice(0, index)
          .filter(l => l.type.includes("Insulation")).length + 1;
        return { ...layer, type: `Insulation ${insulationIndex}` };
      }
      return layer;
    });
    
    setLayers(updatedLayers);
  };

  const updateLayerName = (id: string, name: string) => {
    setLayers(layers.map(layer => 
      layer.id === id ? { ...layer, name } : layer
    ));
  };

  return (
    <div className="insulation-card">
      <div className="insulation-card-header">
        <h2>Insulation Layers</h2>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="text-left text-gray-600 text-sm">
              <th className="w-8"></th>
              <th className="px-4 py-2 w-1/4">Type</th>
              <th className="px-4 py-2 w-1/2">Name</th>
              <th className="px-4 py-2 w-1/4">Thickness</th>
              <th className="w-8"></th>
            </tr>
          </thead>
          <tbody>
            {layers.map((layer) => (
              <tr key={layer.id} className="border-t">
                <td className="pl-2 py-3">
                  <div className={`w-4 h-4 rounded-full ${layer.color}`}></div>
                </td>
                <td className="px-4 py-2">{layer.type}</td>
                <td className="px-4 py-2">
                  <Select 
                    value={layer.name} 
                    onValueChange={(value) => updateLayerName(layer.id, value)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select material" />
                    </SelectTrigger>
                    <SelectContent>
                      {materialOptions[layer.type as keyof typeof materialOptions]?.map((option) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </td>
                <td className="px-4 py-2">{layer.thickness}</td>
                <td>
                  {layer.type.includes("Insulation") && (
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-6 w-6 text-gray-400 hover:text-red-500"
                      onClick={() => removeLayer(layer.id)}
                    >
                      <XIcon className="h-4 w-4" />
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="flex justify-end mt-4">
        <Button 
          variant="outline" 
          size="sm" 
          className="text-app-blue border-app-blue hover:bg-app-blue hover:text-white"
          onClick={addLayer}
        >
          <PlusIcon className="h-4 w-4 mr-1" />
          ADD LAYER
        </Button>
      </div>
    </div>
  );
};

export default InsulationLayers;
