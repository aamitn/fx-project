// InsulationLayers.tsx
import { useState, useEffect } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { PlusIcon, X as XIcon, TrashIcon } from "lucide-react";
import { HexColorPicker } from "react-colorful";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogCancel,
  AlertDialogAction
} from "@/components/ui/alert-dialog";
import { useInsulation, InsulationLayer } from "@/contexts/InsulationContext";
import { fetchMaterialOptions } from "@/utils/api";


const hslToHex = (h: number, s: number, l: number): string => {
  s /= 100;
  l /= 100;

  const k = (n: number) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) =>
    Math.round(
      255 *
        (l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1))))
    )
      .toString(16)
      .padStart(2, "0");

  return `#${f(0)}${f(8)}${f(4)}`;
};

const generateContrastingColor = (index: number, total: number): string => {
  const hue = Math.floor((360 / total) * index); // evenly spaced hues
  return hslToHex(hue, 70, 60); // convert to HEX
};

const InsulationLayers = () => {
  const { layers, setLayers } = useInsulation();
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [materialNames, setMaterialNames] = useState<string[]>([]);
  const [loadingMaterials, setLoadingMaterials] = useState(true);

  useEffect(() => {
    const loadMaterials = async () => {
      try {
        setLoadingMaterials(true);
        const materials = await fetchMaterialOptions();
        setMaterialNames(materials);
      } catch (error) {
        console.error("Failed to load materials:", error);
      } finally {
        setLoadingMaterials(false);
      }
    };

    loadMaterials();
  }, []);

  const getMaterialOptions = (layerType: string) => {
    // For insulation layers, use API materials, for others use static options
    if (layerType.includes("Insulation")) {
      return materialNames;
    }
    
    const staticOptions: Record<string, string[]> = {
      "Base Metal": ["PVC", "Steel", "Aluminum", "Copper"],
      "Jacket Material": ["0.9 – All Service Jacket", "Aluminum", "Stainless Steel", "PVC"],
    };
    
    return staticOptions[layerType] || [];
  };

  const handleColorChange = (id: string, newColor: string) => {
    setLayers((prev) =>
      prev.map((layer) =>
        layer.id === id ? { ...layer, color: newColor } : layer
      )
    );
  };

  // NEW HANDLER FOR THICKNESS CHANGE
  const handleThicknessChange = (id: string, newThickness: string) => {
    setLayers((prevLayers) =>
      prevLayers.map((layer) =>
        layer.id === id ? { ...layer, thickness: newThickness } : layer
      )
    );
  };

const addLayer = () => {
  const insulationLayers = layers.filter(layer => layer.type.includes("Insulation"));
  const count = insulationLayers.length;

  const newLayer: InsulationLayer = {
    id: Date.now().toString(),
    type: `Insulation ${count + 1}`,
    name: "Select Material",
    thickness: "50", // Default thickness for new insulation layers
    color: generateContrastingColor(count, 10), // 10 is max distinct colors
  };

  // Find the index of the last insulation layer
  const lastInsulationIndex = layers.reduce((acc, layer, index) => {
    if (layer.type.includes("Insulation")) {
      return index;
    }
    return acc;
  }, -1);


  // Insert the new insulation layer after the last existing insulation layer
  // If no insulation layers exist (e.g., initial state), insert at the beginning
  const newLayers = [...layers];
  if (lastInsulationIndex === -1) {
    newLayers.unshift(newLayer); // Add to the start if no insulation layers
  } else {
    newLayers.splice(lastInsulationIndex + 1, 0, newLayer);
  }
  setLayers(newLayers);
};


// Renamed for clarity to remove all insulation layers except the first base/jacket
const removeAllInsulationLayersButFirst = () => {
    // Filter out base metal and jacket material layers, then remove all but the first insulation layer
    const nonInsulationLayers = layers.filter(layer => !layer.type.includes("Insulation"));
    const insulationLayers = layers.filter(layer => layer.type.includes("Insulation"));

    if (insulationLayers.length === 0) return; // No insulation layers to remove

    // Keep only the first insulation layer, if it exists
    const firstInsulationLayer = insulationLayers[0];
    const newInsulationLayers = firstInsulationLayer ? [firstInsulationLayer] : [];

    // Combine non-insulation layers with the first insulation layer
    const updatedLayers = [...nonInsulationLayers, ...newInsulationLayers];
    
    // If no layers remain, reset to a single default insulation layer
    if (updatedLayers.length === 0) {
        setLayers([{ id: Date.now().toString(), type: 'Insulation 1', name: 'Select Material', thickness: '50', color: '#ADD8E6' }]);
    } else {
        // Renumber insulation layers if necessary
        let insulationCounter = 1;
        const renumberedLayers = updatedLayers.map(layer => {
            if (layer.type.includes("Insulation")) {
                return { ...layer, type: `Insulation ${insulationCounter++}` };
            }
            return layer;
        });
        setLayers(renumberedLayers);
    }
    setShowConfirmDialog(false);
};


const removeLayer = (id: string) => {
  const newLayers = layers.filter(layer => layer.id !== id);

  // If the removed layer was an insulation layer and it was the last one,
  // we must ensure there's always at least one insulation layer for the system to function.
  const remainingInsulationLayers = newLayers.filter(l => l.type.includes("Insulation"));
  if (remainingInsulationLayers.length === 0 && layers.find(l => l.id === id)?.type.includes("Insulation")) {
    // Prevent removal if it's the last insulation layer.
    // Optionally, you can add a new default insulation layer here.
    alert("Cannot remove the last insulation layer. At least one insulation layer is required.");
    return;
  }

  // Re-index insulation layers to maintain sequential numbering
  let insulationCount = 1;
  const updatedLayers = newLayers.map(layer => {
    if (layer.type.includes("Insulation")) {
      return { ...layer, type: `Insulation ${insulationCount++}` };
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
                    <Popover>
                      <PopoverTrigger asChild>
                        <div
                          className="w-6 h-6 rounded-full cursor-pointer border"
                          style={{ backgroundColor: layer.color }}
                          title="Click to pick color"
                        ></div>
                      </PopoverTrigger>
                      <PopoverContent className="w-56 space-y-2">
                        <HexColorPicker
                          color={layer.color}
                          onChange={(newColor) => handleColorChange(layer.id, newColor)}
                        />
                        <input
                          type="text"
                          className="w-full border px-2 py-1 rounded text-sm font-mono"
                          value={layer.color}
                          onChange={(e) => handleColorChange(layer.id, e.target.value)}
                          maxLength={7}
                          placeholder="#rrggbb"
                        />
                      </PopoverContent>
                    </Popover>
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
                      {loadingMaterials ? (
                        <SelectItem value="loading" disabled>Loading materials...</SelectItem>
                      ) : (
                        getMaterialOptions(layer.type).map((option) => (
                          <SelectItem key={option} value={option}>
                            {option}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </td>
                <td className="px-4 py-2">
                  {layer.type.includes("Insulation") || layer.type.includes("Base Metal") || layer.type.includes("Jacket Material") ? ( // Allow thickness input for all types
                    <input
                      type="text" // Keep as text to allow empty input initially or non-numeric if desired
                      className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                      value={layer.thickness}
                      onChange={(e) => handleThicknessChange(layer.id, e.target.value)} // Use the new handler
                      placeholder="Enter thickness"
                    />
                  ) : (
                    layer.thickness // If not editable, just display
                  )}
                </td>
                  <td>
                    {layer.type.includes("Insulation") && ( // Only allow removing insulation layers
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-6 w-6 text-gray-400 hover:text-red-500 disabled:opacity-50"
                        onClick={() => removeLayer(layer.id)}
                        disabled={layers.filter(l => l.type.includes("Insulation")).length <= 1} // Disable if only one insulation layer remains
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
      
      <div className="flex justify-end mt-4 space-x-2">
        <Button 
          variant="outline" 
          size="sm" 
          className="text-app-blue border-app-blue hover:bg-app-blue hover:text-white"
          onClick={addLayer}
        >
          <PlusIcon className="h-4 w-4 mr-1" />
          ADD LAYER
        </Button>

        <Button
          variant="outline"
          size="sm"
          className="text-red-600 border-red-600 hover:bg-red-600 hover:text-white disabled:opacity-50"
          onClick={() => setShowConfirmDialog(true)}
          disabled={layers.filter(l => l.type.includes("Insulation")).length <= 1} // Disable if only one insulation layer remains
        >
          <TrashIcon className="h-4 w-4 mr-1" />
          REMOVE ALL INSULATION
        </Button>
      </div>

      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove all insulation layers?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove all insulation layers except the first one. Base Metal and Jacket Material layers will remain. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowConfirmDialog(false)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={removeAllInsulationLayersButFirst} className="bg-red-600 hover:bg-red-700">
              Yes, Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default InsulationLayers;