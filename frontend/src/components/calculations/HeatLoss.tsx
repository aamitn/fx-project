// HeatLoss.tsx
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { FileText } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceArea,
  ReferenceLine,
  Brush, // Import Brush component
} from 'recharts';

interface HeatLossProps {
  results?: any;
  layers: any[]; // Still needed for layer names, even if thickness from graphPoints
  onCalculate?: (data: Record<string, any>) => void;
}

export const HeatLoss = ({ results, layers, onCalculate }: HeatLossProps) => {
  const [analysisNo, setAnalysisNo] = useState<string>("");
  const [numberOfRefLayers, setNumberOfRefLayers] = useState<number>(layers.length);
  const [surfaceOrientation, setSurfaceOrientation] = useState<string>("Wall");
  const [surfaceArea, setSurfaceArea] = useState<number | null>(12.5);
  const [surfaceName, setSurfaceName] = useState<string>("Wall 1");
  const [unit, setUnit] = useState<string>("English");
  const [surfaceType, setSurfaceType] = useState<string>("Flat");
  const [insideRadius, setInsideRadius] = useState<number | null>(null);
  const [includeFreezePlane, setIncludeFreezePlane] = useState<boolean>(false);
  const [convectionType, setConvectionType] = useState<string>("Natural");
  const [airVelocity, setAirVelocity] = useState<number>(0.5);
  const [emissivity, setEmissivity] = useState<number>(0.9);
  const [ambientTemp, setAmbientTemp] = useState<number>(25);
  const [hotFaceTemp, setHotFaceTemp] = useState<number>(1000);
  const [porousGas, setPorousGas] = useState<boolean>(false);
  const [gasType, setGasType] = useState<string | null>(null);
  const [freezePlaneTemp, setFreezePlaneTemp] = useState<number | null>(null);
  const [showFrontendGraph, setShowFrontendGraph] = useState<boolean>(false);

  const surfaceOrientationOptions = ["Wall", "Roof", "Floor"];
  const surfaceTypeOptions = ["Flat", "Curved"];
  const convectionTypeOptions = ["Natural", "Forced"];
  const unitOptions = ["English", "Metric Joules", "Metric-Cal"];
  const gasTypeOptions = ["Hydrogen 25%", "Hydrogen 50%", "Hydrogen 75%", "Hydrogen 100%", "Nitrogen", "Argon", "Hydrogen X%"];

  const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5227';

  useEffect(() => {
    setNumberOfRefLayers(layers.length);
  }, [layers]);

  const transformData = () => {
    const transformedData: any = {};
    if (results?.temperatureResults) {
      const numLayers = results.temperatureResults.length;

      transformedData["No"] = results.temperatureResults.map((r: any) => r.no);
      transformedData[`Heat Storage (${results.heatStoragePerM2Unit})`] = results.temperatureResults.map((r: any) => r.heatStorage);
      transformedData[`Hot Side Temp (${results.coldFaceTempUnit})`] = results.temperatureResults.map((r: any) => r.hotSideTemp);
      transformedData[`Cold Side Temp (${results.coldFaceTempUnit})`] = results.temperatureResults.map((r: any) => r.coldSideTemp);

      transformedData.layersCount = numLayers;
    }
    return transformedData;
  };

  const transformedResults = results ? transformData() : null;

  const getImageBase64 = async (imageUrl: string) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64StringWithPrefix = reader.result as string;
          const rawBase64 = base64StringWithPrefix.split(',')[1];
          resolve(rawBase64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error("Error converting image to Base64:", error);
      return null;
    }
  };

  const generateReport = async () => {
    if (!results) {
      console.error("No results available to generate report.");
      return;
    }

    let base64Image: string | null = null;
    if (results.graphImageUrl) {
      try {
        base64Image = (await getImageBase64(results.graphImageUrl)) as string;
      } catch (error) {
        console.error("Failed to convert graph to base64", error);
      }
    }

    const reportData = {
      analysisNo: analysisNo,
      surfaceName: surfaceName,
      hotSideTemp: hotFaceTemp,
      ambientTemp: ambientTemp,
      velocity: airVelocity,
      emissivity: emissivity,
      freezePlaneTemp: freezePlaneTemp,
      area: surfaceArea,
      coldFaceTemp: results.coldFaceTemp,
      heatLoss: results.heatLossPerM2,
      totalHeatLoss: results.totalHeatLoss,
      freezePlaneDepth: results.locatedDistance,
      layers: layers.map((layer: any, index: number) => ({
        key: layer.id,
        layerNumber: index + 1,
        thickness: parseFloat(layer.thickness),
        product: layer.name,
        maxLimitTemp: layer.maxOperatingTemperature || 1350,
        hotSideTemp: transformedResults?.["Hot Side Temp (" + results.coldFaceTempUnit + ")"]?.[index] ?? 0,
        coldSideTemp: transformedResults?.["Cold Side Temp (" + results.coldFaceTempUnit + ")"]?.[index] ?? 0,
        limitExceeded: false,
      })),
      base64Image: base64Image,
      heatLossPerM2Unit: results.heatLossPerM2Unit,
      heatStoragePerM2Unit: results.heatStoragePerM2Unit,
      coldFaceTempUnit: results.coldFaceTempUnit,
      totalHeatLossUnit: results.totalHeatLossUnit,
      locatedDistanceUnit: results.locatedDistanceUnit,
      unit: unit,
    };

    try {
      const response = await fetch(`${baseUrl}/api/report/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(reportData),
      });

      if (response.ok) {
        console.log("Report generated successfully!");
        const blob = await response.blob();

        const url = window.URL.createObjectURL(blob);

        const a = document.createElement("a");
        a.href = url;
        a.download = "heat_loss_report.pdf";

        document.body.appendChild(a);
        a.click();

        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);

      } else {
        console.error("Failed to generate report:", response.statusText);
      }
    } catch (error) {
      console.error("Error calling report API:", error);
    }
  };

  const layerBoundaries = [];
  if (results?.graphPoints && results.graphPoints.length > 1) {
    const numberOfLayersFromGraph = results.graphPoints.length - 1;

    // Define a set of more distinct colors
    const layerColors = ["#ADD8E6", "#90EE90", "#FFDAB9", "#E6E6FA", "#FFFACD", "#B0E0E6"]; // Light Blue, Light Green, Peach, Lavender, Lemon Chiffon, Powder Blue

    for (let i = 0; i < numberOfLayersFromGraph; i++) {
      const startX = results.graphPoints[i].x;
      const endX = results.graphPoints[i + 1].x;
      const layerThickness = endX - startX;

      const layerName = layers[i]?.name || `Unknown Material`;

      // Assign color from the defined array, cycling through it
      const color = layerColors[i % layerColors.length]; 

      layerBoundaries.push({
        start: startX,
        end: endX,
        name: `Layer ${i + 1}: ${layerName}`,
        thickness: layerThickness,
        color: color
      });
    }
  }

  return (
    <div className="border rounded-md p-4 mb-4" data-tab="heat-loss">
      <h3 className="font-medium mb-4">Heat Loss Calculation</h3>

      <style>{`
        .custom-switch {
          position: relative;
          display: inline-block;
          width: 48px;
          height: 24px;
        }

        .custom-switch input {
          opacity: 0;
          width: 0;
          height: 0;
        }

        .slider {
          position: absolute;
          cursor: pointer;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: #ccc;
          -webkit-transition: .4s;
          transition: .4s;
          border-radius: 24px;
        }

        .slider:before {
          position: absolute;
          content: "";
          height: 18px;
          width: 18px;
          left: 3px;
          bottom: 3px;
          background-color: white;
          -webkit-transition: .4s;
          transition: .4s;
          border-radius: 50%;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }

        input:checked + .slider {
          background-color: #2563eb;
        }

        input:focus + .slider {
          box-shadow: 0 0 1px #2563eb;
        }

        input:checked + .slider:before {
          -webkit-transform: translateX(24px);
          -ms-transform: translateX(24px);
          transform: translateX(24px);
        }

        .slider:hover {
          background-color: #b3b3b3;
        }

        input:checked + .slider:hover {
          background-color: #1d4ed8;
        }
      `}</style>

      {/* Hidden inputs to expose Select values to DOM for Calculations.tsx's collectFormData */}
      <input type="hidden" id="surfaceOrientation" value={surfaceOrientation} />
      <input type="hidden" id="unit" value={unit.toLowerCase()} />
      <input type="hidden" id="surfaceType" value={surfaceType} />
      <input type="hidden" id="convectionType" value={convectionType} />
      {porousGas && <input type="hidden" id="gasType" value={gasType || ''} />}

      <div className="flex flex-col md:flex-row gap-8">
        {/* Primary Inputs Group */}
        <div className="flex-1 border border-gray-200 rounded-lg p-6 shadow-sm">
          <h4 className="font-semibold text-lg mb-4 text-gray-800">Primary Inputs</h4>
          <div className="space-y-4">
            <div>
              <Label htmlFor="analysisNo" className="block text-sm font-medium text-gray-700">Analysis No</Label>
              <Input
                type="text"
                id="analysisNo"
                value={analysisNo}
                onChange={(e) => setAnalysisNo(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm"
              />
            </div>

            <div>
              <Label htmlFor="unit">Unit System</Label>
              <Select value={unit} onValueChange={setUnit}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select unit system" />
                </SelectTrigger>
                <SelectContent>
                  {unitOptions.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="numberOfRefLayers">Number of Ref Layers</Label>
              <Input
                type="number"
                id="numberOfRefLayers"
                value={numberOfRefLayers}
                onChange={(e) => setNumberOfRefLayers(Number(e.target.value))}
                disabled
              />
            </div>

            <div>
              <Label htmlFor="surfaceOrientation">Surface Orientation</Label>
              <Select value={surfaceOrientation} onValueChange={setSurfaceOrientation}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select orientation" />
                </SelectTrigger>
                <SelectContent>
                  {surfaceOrientationOptions.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="surfaceArea">Surface Area ({unit === "English" ? "ft²" : "m²"})</Label>
              <Input
                type="number"
                id="surfaceArea"
                value={surfaceArea || ""}
                onChange={(e) => setSurfaceArea(e.target.value === "" ? null : Number(e.target.value))}
                placeholder="Optional"
              />
            </div>

            <div>
              <Label htmlFor="surfaceName">Surface Name</Label>
              <Input
                type="text"
                id="surfaceName"
                value={surfaceName}
                onChange={(e) => setSurfaceName(e.target.value)}
              />
            </div>
          </div>

          <div className="pt-6 border-t border-gray-200 mt-6">
            <h4 className="font-semibold text-lg mb-4 text-gray-800">Surface Type</h4>
            <div className="space-y-4">
              <div>
                <Label htmlFor="surfaceType">Surface Type</Label>
                <Select value={surfaceType} onValueChange={setSurfaceType}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {surfaceTypeOptions.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {surfaceType === "Curved" && (
                <div className="mt-4">
                  <Label htmlFor="insideRadius">Inside Radius ({unit === "English" ? "in" : "cm"})</Label>
                  <Input
                    type="number"
                    id="insideRadius"
                    value={insideRadius || ""}
                    onChange={(e) => setInsideRadius(e.target.value === "" ? null : Number(e.target.value))}
                    placeholder="Required for Curved"
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Operating Parameters Group */}
        <div className="flex-1 border border-gray-200 rounded-lg p-6 shadow-sm">
          <h4 className="font-semibold text-lg mb-4 text-gray-800">Operating Parameters</h4>
          <div className="space-y-4">
          <div className="flex items-center justify-between">

              <Label htmlFor="includeFreezePlane" className="text-sm font-medium text-gray-700">Include Freeze Plane</Label>
              <label className="custom-switch" /* REMOVED htmlFor="includeFreezePlane" */>
                <input
                  type="checkbox"
                  id="includeFreezePlane"
                  checked={includeFreezePlane}
                  onChange={(e) => setIncludeFreezePlane(e.target.checked)}
                aria-labelledby="includeFreezePlaneLabel" // (If you give your <Label> component an ID)
                />
                <span className="slider" aria-hidden="true"></span> {/* aria-hidden for purely decorative elements */}
              </label>
            </div>

            {includeFreezePlane && (
              <div>
                <Label htmlFor="freezePlaneTemp">Freeze Plane Temp ({results?.coldFaceTempUnit || (unit === "English" ? '°F' : '°C')})</Label>
                <Input
                  type="number"
                  id="freezePlaneTemp"
                  value={freezePlaneTemp || ""}
                  onChange={(e) => setFreezePlaneTemp(e.target.value === "" ? null : Number(e.target.value))}
                  placeholder="Required if included"
                />
              </div>
            )}

            <div>
              <Label htmlFor="convectionType">Convection Type</Label>
              <Select value={convectionType} onValueChange={setConvectionType}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {convectionTypeOptions.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {convectionType === "Forced" && (
              <div>
                <Label htmlFor="airVelocity">Air Velocity ({unit === "English" ? "ft/s" : "m/s"})</Label>
                <Input
                  type="number"
                  id="airVelocity"
                  value={airVelocity}
                  onChange={(e) => setAirVelocity(Number(e.target.value))}
                />
              </div>
            )}

            <div>
              <Label htmlFor="emissivity">Emissivity</Label>
              <Input
                type="number"
                id="emissivity"
                value={emissivity}
                onChange={(e) => setEmissivity(Number(e.target.value))}
                step="0.01"
                min="0"
                max="1"
              />
            </div>

            <div>
              <Label htmlFor="ambientTemp">Ambient Temp ({results?.coldFaceTempUnit || (unit === "English" ? '°F' : '°C')})</Label>
              <Input
                type="number"
                id="ambientTemp"
                value={ambientTemp}
                onChange={(e) => setAmbientTemp(Number(e.target.value))}
              />
            </div>

            <div>
              <Label htmlFor="hotFaceTemp">Hot Face Temp ({results?.coldFaceTempUnit || (unit === "English" ? '°F' : '°C')})</Label>
              <Input
                type="number"
                id="hotFaceTemp"
                value={hotFaceTemp}
                onChange={(e) => setHotFaceTemp(Number(e.target.value))}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="porousGas" className="text-sm font-medium text-gray-700">
                Porous Gas
              </Label>
              <label className="custom-switch" htmlFor="porousGas">
                <input
                  type="checkbox"
                  id="porousGas"
                  aria-label="Porous Gas"
                  checked={porousGas}
                  onChange={(e) => setPorousGas(e.target.checked)}
                />
                <span className="slider"></span>
              </label>
            </div>

            {porousGas && (
              <div>
                <Label htmlFor="gasType">Gas Type</Label>
                <Select value={gasType || ""} onValueChange={setGasType}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select gas type" />
                  </SelectTrigger>
                  <SelectContent>
                    {gasTypeOptions.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mt-6 border border-gray-200 rounded-lg p-6 shadow-sm">
        <h4 className="font-semibold text-lg mb-4 text-gray-800">Insulation Layers</h4>
        {layers && layers.length > 0 ? (
          <ul className="space-y-2">
            {layers.map((layer, index) => (
              <li key={index} className="text-sm">
                <span className="font-medium">Layer {index + 1}:</span> {layer.name} - {layer.thickness} {unit === "English" ? "in" : "cm"}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-gray-500">No insulation layers defined.</p>
        )}
      </div>

      {/* Results Section */}
      {results && (
        <div className="mt-8 p-3 bg-gray-50 rounded-md border">
          <h4 className="font-medium text-lg mb-4">Calculation Results</h4>
          {transformedResults && transformedResults.layersCount > 0 ? (
            <div className="overflow-x-auto mb-4">
              <table className="min-w-full border border-gray-300">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="py-2 px-4 border-b text-left">Property</th>
                    {Array.from({ length: transformedResults.layersCount }, (_, i) => (
                      <th key={`header-${i}`} className="py-2 px-4 border-b text-left">Layer {i + 1}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {Object.keys(transformedResults)
                    .filter(key => key !== 'layersCount')
                    .map((key, index) => (
                      <tr key={index} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                        <th className="py-2 px-4 border-b text-left">{key}</th>
                        {transformedResults[key].map((value: any, i: number) => (
                          <td key={`data-${index}-${i}`} className="py-2 px-4 border-b">{value}</td>
                        ))}
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-sm text-gray-500">No temperature results to display.</p>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm mt-4">
            <p><span className="font-semibold">Heat Loss per Unit Area:</span> {results.heatLossPerM2} {results.heatLossPerM2Unit}</p>
            <p><span className="font-semibold">Heat Storage per Unit Area:</span> {results.heatStoragePerM2} {results.heatStoragePerM2Unit}</p>
            <p><span className="font-semibold">Cold Face Temp:</span> {results.coldFaceTemp} {results.coldFaceTempUnit}</p>
            <p><span className="font-semibold">Total Heat Loss:</span> {results.totalHeatLoss} {results.totalHeatLossUnit}</p>
            <p><span className="font-semibold">Located Distance:</span> {results.locatedDistance} {results.locatedDistanceUnit}</p>
          </div>

          {results.graphPoints && results.graphPoints.length > 0 && (
            <div className="mt-4">
              <h5 className="font-medium text-sm mb-2">Graph Points:</h5>
              <div className="flex flex-wrap gap-2">
                {results.graphPoints.map((point: any, index: number) => (
                  <Badge key={index}>{`X: ${point.x} ${results.locatedDistanceUnit}, Y: ${point.y} ${results.coldFaceTempUnit}`}</Badge>
                ))}
              </div>
                  <div className="flex items-center justify-start mt-4">
                    <Label
                      htmlFor="graphToggle"
                      id="graphToggleLabel"
                      className="text-sm font-medium text-gray-700 mr-2"
                    >
                      Show Frontend Graph
                    </Label>
                    <label className="custom-switch"> {/* <--- REMOVE htmlFor="graphToggle" here */}
                      <input
                        type="checkbox"
                        id="graphToggle"
                        checked={showFrontendGraph}
                        onChange={(e) => setShowFrontendGraph(e.target.checked)}
                        aria-labelledby="graphToggleLabel" // <--- ADD THIS attribute
                      />
                      <span className="slider" aria-hidden="true"></span> {/* <--- ADD aria-hidden="true" */}
                    </label>
                  </div>
            </div>
          )}

          {/* Conditional rendering for graphs */}
          {showFrontendGraph && results.graphPoints && results.graphPoints.length > 0 ? (
            <div className="mt-4 w-full h-80">
              <h5 className="font-medium text-sm mb-2">Interactive Temperature Profile:</h5>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={results.graphPoints}
                  margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="x" type="number" label={{ value: `Distance (${results.locatedDistanceUnit})`, position: 'insideBottomRight', offset: 0 }} />
                  <YAxis type="number" label={{ value: `Temperature (${results.coldFaceTempUnit})`, angle: -90, position: 'insideLeft' }} />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="y" stroke="#8884d8" name="Temperature" activeDot={{ r: 8 }} />

                  {/* Add ReferenceAreas for layers */}
                  {layerBoundaries.map((boundary, index) => (
                    <ReferenceArea
                      key={`layer-area-${index}`}
                      x1={boundary.start}
                      x2={boundary.end}
                      strokeOpacity={0.3}
                      fill={boundary.color} // Using the assigned color
                      label={{
                        value: `${boundary.name} (${boundary.thickness.toFixed(2)} ${results.locatedDistanceUnit})`,
                        position: 'top',
                        offset: 10,
                        fontSize: 12,
                        fill: '#333',
                        dx: (boundary.end - boundary.start) / 2 > 0 ? (boundary.end - boundary.start) / 2 : 0
                      }}
                    />
                  ))}
                   {/* Add ReferenceLines for layer boundaries */}
                   {layerBoundaries.map((boundary, index) => (
                    <ReferenceLine
                      key={`layer-line-${index}`}
                      x={boundary.end}
                      stroke="grey"
                      strokeDasharray="3 3"
                      label={{
                        value: `${boundary.end.toFixed(2)} ${results.locatedDistanceUnit}`,
                        position: 'insideBottomRight',
                        offset: 5,
                        fontSize: 10,
                        fill: 'grey',
                        angle: -90
                      }}
                    />
                  ))}

                  {/* Add the Brush component for zooming */}
                  <Brush
                    dataKey="x" // The data key for the X-axis (distance)
                    height={30} // Height of the brush area
                    stroke="#8884d8" // Color of the brush selection
                    fill="#F0F8FF" // Background color of the brush
                    travellerWidth={10} // Width of the selection handles
                  />

                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : results.graphImageUrl && (
            <div className="mt-4">
              <img src={results.graphImageUrl} alt="Heat Loss Graph" className="max-w-full" />
            </div>
          )}
        </div>
      )}

      <Button
        className="mt-10 bg-app-blue hover:bg-app-blue-dark text-white flex items-center gap-2"
        onClick={generateReport}
        disabled={!results}
      >
        <FileText className="w-5 h-5" />
        <span>Generate Report</span>
      </Button>
    </div>
  );
};