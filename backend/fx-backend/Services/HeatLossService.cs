using fx_backend.Models.DTOs;
using fx_backend.Services;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace fx_backend.Services
{
    public class HeatLossService
    {
        private readonly MaterialService _materialService;
        private readonly ILogger<HeatLossService> _logger;

        // Stefan-Boltzmann constant (W/m²·K⁴) - SI units
        private const double StefanBoltzmannConstant = 5.670374419e-8;

        // Unit Conversion Constants (to SI units for internal calculation)
        // Temperatures: Celsius is already close to Kelvin for deltaT, but need conversion for absolute temps
        private const double C_TO_K = 273.15;
        private const double F_TO_C_OFFSET = 32.0;
        private const double F_TO_C_FACTOR = 5.0 / 9.0;
        private const double C_TO_F_FACTOR = 9.0 / 5.0;
        private const double C_TO_F_OFFSET = 32.0;

        // Length: cm to m
        private const double CM_TO_M = 0.01;
        // Length: inches to m
        private const double INCH_TO_M = 0.0254;

        // Area: ft² to m²
        private const double SQFT_TO_SQM = 0.092903;

        // Energy/Heat: BTU to Joules (or Watts for rate)
        private const double BTU_TO_J = 1055.06;
        private const double KCAL_TO_J = 4184.0; // 1 kcal = 4.184 kJ

        // Heat Rate: BTU/hr to Watts
        private const double BTU_PER_HR_TO_W = BTU_TO_J / 3600.0; // BTU/hr * (1055.06 J / 1 BTU) * (1 hr / 3600 s) = J/s = W
        // Heat Rate: kcal/hr to Watts
        private const double KCAL_PER_HR_TO_W = KCAL_TO_J / 3600.0;

        // Thermal Conductivity: BTU/hr-ft-F to W/m-K
        private const double BTU_PER_HR_FT_F_TO_W_PER_M_K = 1.730735; // 1 BTU/hr-ft-F = 1.730735 W/m-K

        // Specific Heat: BTU/lb-F to J/kg-K (or kJ/kg-K)
        private const double BTU_PER_LB_F_TO_J_PER_KG_K = 4186.8; // 1 BTU/lb-F = 4186.8 J/kg-K (approx 4.1868 kJ/kg-K)

        // Density: lb/ft³ to kg/m³
        private const double LB_PER_FT3_TO_KG_PER_M3 = 16.0185;


        public HeatLossService(MaterialService materialService, ILogger<HeatLossService> logger)
        {
            _materialService = materialService;
            _logger = logger;
        }

        public async Task<HeatLossResultDto> AnalyzeHeatLossAsync(HeatLossInputDto input)
        {
            _logger.LogInformation("Received heat loss input: {@Input}", input);

            if (input.Layers == null || input.Layers.Count != input.NumberOfRefLayers)
            {
                _logger.LogWarning("Mismatch: expected {Expected}, received {Actual} layers",
                    input.NumberOfRefLayers, input.Layers?.Count ?? 0);
                throw new ArgumentException("Mismatch between number of layers and NumberOfRefLayers.");
            }

            // Determine the unit system for input and output
            string unitSystem = input.Unit?.ToLower() ?? "english"; // Default to English

            // --- Convert all inputs to SI units for internal calculation ---
            double hotFaceTemp_SI = input.HotFaceTemp;
            double ambientTemp_SI = input.AmbientTemp;
            double? freezePlaneTemp_SI = input.FreezePlaneTemp;
            double airVelocity_SI = input.AirVelocity;
            double? surfaceArea_SI = input.SurfaceArea;
            double? insideRadius_SI = input.InsideRadius;

            // Temperatures
            if (unitSystem == "english")
            {
                hotFaceTemp_SI = (input.HotFaceTemp - F_TO_C_OFFSET) * F_TO_C_FACTOR;
                ambientTemp_SI = (input.AmbientTemp - F_TO_C_OFFSET) * F_TO_C_FACTOR;
                if (input.FreezePlaneTemp.HasValue)
                {
                    freezePlaneTemp_SI = (input.FreezePlaneTemp.Value - F_TO_C_OFFSET) * F_TO_C_FACTOR;
                }
            }
            // Metric-Joules and Metric-Cal already use Celsius for input temps, which is fine for SI deltaT,
            // but for absolute temps in radiation, we need Kelvin, which is handled in CalculateSurfaceHeatTransferCoefficient.

            // Lengths (Thickness, InsideRadius)
            // For consistency, I will assume input.Layers[i].Thickness is always in cm, and input.InsideRadius is always in cm.
            // These will be converted to meters for internal calculations.
            // If the user expects inches for InsideRadius when English is selected, the DTO would need to change.
            // For now, the 'Unit' field only affects output and internal interpretation, not input parsing units (except for temps).

            // SurfaceArea: Assuming input.SurfaceArea is always in m² as per DTO comment.
            // If English unit means ft² for SurfaceArea, this needs adjustment.
            // For now, I'll assume input.SurfaceArea is always m², and if 'English' is selected, it represents ft² and needs conversion.
            if (unitSystem == "english" && input.SurfaceArea.HasValue)
            {
                surfaceArea_SI = input.SurfaceArea.Value * SQFT_TO_SQM; // Convert ft² to m²
            }


            var result = new HeatLossResultDto();
            double currentHotSideTemp_Calc = hotFaceTemp_SI; // Temperature in Celsius for calculation
            double totalConductiveResistance = 0.0;
            double totalHeatStorage = 0.0;
            double lastLayerColdSideTemp_Calc = hotFaceTemp_SI;
            double lastLayerOuterRadius_m = 0.0;

            double currentInnerRadius_m = 0.0;
            if (input.SurfaceType == "Curved")
            {
                if (!input.InsideRadius.HasValue || input.InsideRadius.Value <= 0)
                {
                    throw new ArgumentException("InsideRadius must be provided and positive for Curved surface type.");
                }
                // Convert input InsideRadius (cm) to meters
                currentInnerRadius_m = input.InsideRadius.Value * CM_TO_M;
                lastLayerOuterRadius_m = currentInnerRadius_m;
            }

            // Initialize accumulated thickness for graph points
            double accumulatedThickness_m = 0.0;
            result.GraphPoints.Clear(); // Ensure the list is empty before populating

            for (int i = 0; i < input.Layers.Count; i++)
            {
                var layer = input.Layers[i];
                var materialName = layer.MaterialName;
                _logger.LogInformation("Processing Layer {LayerNo} - Material: {Material}", i + 1, materialName);

                // Fetch material properties. These are assumed to be in a consistent unit system (e.g., SI or default for MaterialService).
                // If MaterialService returns different units based on material, this needs more complex handling.
                // For now, assuming GetConductivitiesAsync returns W/m-K, GetSpecificHeatAsync returns kJ/kg-K, GetDensityAsync returns kg/m³.
                var conductivityList = await _materialService.GetConductivitiesAsync(materialName);
                var specificHeatMaterial = await _materialService.GetSpecificHeatAsync(materialName) ?? 0; // kJ/kg-K
                var densityMaterial = await _materialService.GetDensityAsync(materialName) ?? 0; // kg/m³

                if (conductivityList == null || conductivityList.Count == 0 || conductivityList.All(k => k == null))
                {
                    _logger.LogWarning("Conductivity data missing or incomplete for material: {Material}. Using default 1.0 W/m-K.", materialName);
                    conductivityList = new List<double?> { 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0 }; // Fallback to avoid null ref
                }

                _logger.LogDebug("Material Conductivity List: {ConductivityList}, SpecificHeat: {SpecificHeat}, Density: {Density}",
                    string.Join(", ", conductivityList.Select(k => k.ToString())), specificHeatMaterial, densityMaterial);

                // For initial estimation of cold side temp to get average k for this layer
                double estimatedColdSideTemp_Calc = currentHotSideTemp_Calc - ((currentHotSideTemp_Calc - ambientTemp_SI) / input.NumberOfRefLayers);

                // --- Freeze Plane Logic ---
                if (input.IncludeFreezePlane && freezePlaneTemp_SI.HasValue)
                {
                    if (estimatedColdSideTemp_Calc < freezePlaneTemp_SI.Value)
                    {
                        estimatedColdSideTemp_Calc = freezePlaneTemp_SI.Value;
                        _logger.LogDebug("Layer {LayerNo}: Freeze plane detected. Capping estimatedColdSideTemp to {FreezePlaneTemp}C.", i + 1, freezePlaneTemp_SI.Value);
                    }
                }
                // --- End Freeze Plane Logic ---

                double kAvgMaterial = EstimateAverageConductivity(conductivityList, currentHotSideTemp_Calc, estimatedColdSideTemp_Calc);
                // Safeguard: If kAvgMaterial is zero or negative, set it to a small positive value
                if (kAvgMaterial <= 0)
                {
                    _logger.LogWarning("Layer {LayerNo}: Estimated kAvgMaterial is zero or negative ({KAvgMaterial}). Setting to default 0.001 W/m-K to prevent division by zero.", i + 1, kAvgMaterial);
                    kAvgMaterial = 0.001; // A very small, non-zero conductivity
                }
                _logger.LogDebug("Layer {LayerNo}: kAvgMaterial = {KAvgMaterial} W/m-K", i + 1, kAvgMaterial);

                double kAvgEffective = kAvgMaterial;
                double densityEffective = densityMaterial;
                double specificHeatEffective = specificHeatMaterial;


                // --- Porous Gas Implementation ---
                if (input.PorousGas && !string.IsNullOrEmpty(input.GasType))
                {
                    double gasK = GetGasThermalConductivity(input.GasType, (currentHotSideTemp_Calc + estimatedColdSideTemp_Calc) / 2.0);
                    double gasDensity = GetGasDensity(input.GasType, (currentHotSideTemp_Calc + estimatedColdSideTemp_Calc) / 2.0);
                    double gasSpecificHeat = GetGasSpecificHeat(input.GasType, (currentHotSideTemp_Calc + estimatedColdSideTemp_Calc) / 2.0);

                    // Blending for thermal conductivity (70% gas, 30% solid matrix)
                    kAvgEffective = (0.7 * gasK) + (0.3 * kAvgMaterial);

                    // Blending for density and specific heat (assuming 70% porosity / gas volume)
                    densityEffective = (0.7 * gasDensity) + (0.3 * densityMaterial);
                    specificHeatEffective = (0.7 * gasSpecificHeat) + (0.3 * specificHeatMaterial);

                    _logger.LogDebug("Layer {LayerNo}: Porous gas enabled. Gas Type: {GasType}, Gas K={GasK}, Gas Density={GasDensity}, Gas SpecificHeat={GasSpecificHeat}",
                        i + 1, input.GasType, gasK, gasDensity, gasSpecificHeat);
                    _logger.LogDebug("Layer {LayerNo}: Original kAvg={OriginalKAvg}, Adjusted kAvgEffective={AdjustedKAvg}",
                        i + 1, kAvgMaterial, kAvgEffective);
                    _logger.LogDebug("Layer {LayerNo}: Original Density={OriginalDensity}, Adjusted DensityEffective={AdjustedDensity}",
                        i + 1, densityMaterial, densityEffective);
                    _logger.LogDebug("Layer {LayerNo}: Original SpecificHeat={OriginalSpecificHeat}, Adjusted SpecificHeatEffective={AdjustedSpecificHeat}",
                        i + 1, specificHeatMaterial, specificHeatEffective);
                }
                else
                {
                    _logger.LogDebug("Layer {LayerNo}: Porous gas is NOT enabled or GasType is missing. Using kAvgEffective = kAvgMaterial ({KAvgMaterial})", i + 1, kAvgMaterial);
                    _logger.LogDebug("Layer {LayerNo}: Using DensityEffective = DensityMaterial ({DensityMaterial}), SpecificHeatEffective = SpecificHeatMaterial ({SpecificHeatMaterial})",
                        i + 1, densityMaterial, specificHeatMaterial);
                }
                // --- End Porous Gas Implementation ---

                double thickness_m = layer.Thickness * CM_TO_M; // Convert layer thickness from cm to meters
                double layerConductiveResistance;

                if (input.SurfaceType == "Flat")
                {
                    // Ensure kAvgEffective is not zero to avoid division by zero
                    if (kAvgEffective <= 0)
                    {
                        _logger.LogError("Layer {LayerNo}: kAvgEffective is zero or negative ({KAvgEffective}). Cannot calculate conductive resistance. Setting resistance to a very large number.", i + 1, kAvgEffective);
                        layerConductiveResistance = double.MaxValue; // Treat as infinite resistance
                    }
                    else
                    {
                        layerConductiveResistance = thickness_m / kAvgEffective; // m^2*K/W
                    }
                    totalConductiveResistance += layerConductiveResistance;
                    _logger.LogDebug("Layer {LayerNo}: Flat surface. Thickness_m={Thickness_m}, kAvgEffective={KAvgEffective}, LayerConductiveResistance={LayerConductiveResistance}, TotalConductiveResistance={TotalConductiveResistance}",
                        i + 1, thickness_m, kAvgEffective, layerConductiveResistance, totalConductiveResistance);
                }
                else // Curved
                {
                    double currentOuterRadius_m = currentInnerRadius_m + thickness_m;
                    // Ensure kAvgEffective is not zero to avoid division by zero
                    if (kAvgEffective <= 0)
                    {
                        _logger.LogError("Layer {LayerNo}: kAvgEffective is zero or negative ({KAvgEffective}). Cannot calculate conductive resistance for curved surface. Setting resistance to a very large number.", i + 1, kAvgEffective);
                        layerConductiveResistance = double.MaxValue; // Treat as infinite resistance
                    }
                    else
                    {
                        layerConductiveResistance = Math.Log(currentOuterRadius_m / currentInnerRadius_m) / (2 * Math.PI * kAvgEffective); // K/W per meter length
                    }
                    totalConductiveResistance += layerConductiveResistance;

                    currentInnerRadius_m = currentOuterRadius_m;
                    lastLayerOuterRadius_m = currentOuterRadius_m;
                    _logger.LogDebug("Layer {LayerNo}: Curved surface. InnerRadius_m={InnerRadius_m}, OuterRadius_m={OuterRadius_m}, kAvgEffective={KAvgEffective}, LayerConductiveResistance={LayerConductiveResistance}, TotalConductiveResistance={TotalConductiveResistance}",
                        i + 1, currentInnerRadius_m - thickness_m, currentOuterRadius_m, kAvgEffective, layerConductiveResistance, totalConductiveResistance);
                }

                // Heat storage calculation for the layer (kJ/m²)
                // NOW using effective density and specific heat
                double layerHeatStorage_kJ_per_m2 = densityEffective * specificHeatEffective * thickness_m * (currentHotSideTemp_Calc - estimatedColdSideTemp_Calc);
                totalHeatStorage += layerHeatStorage_kJ_per_m2;
                _logger.LogDebug("Layer {LayerNo}: LayerHeatStorage={LayerHeatStorage} kJ/m², TotalHeatStorage={TotalHeatStorage} kJ/m²", i + 1, layerHeatStorage_kJ_per_m2, totalHeatStorage);


                lastLayerColdSideTemp_Calc = estimatedColdSideTemp_Calc;

                // Store results for this layer in the DTO (converted to requested output units)
                result.TemperatureResults.Add(new LayerResultDto
                {
                    No = i + 1,
                    HeatStorage = ConvertHeatStorageToOutputUnit(layerHeatStorage_kJ_per_m2, unitSystem),
                    HotSideTemp = ConvertTempToOutputUnit(currentHotSideTemp_Calc, unitSystem),
                    ColdSideTemp = ConvertTempToOutputUnit(estimatedColdSideTemp_Calc, unitSystem)
                });

                // --- Graph Points Generation (Modified) ---
                // Add point for the hot side of the current layer
                double xCoordHotSide_Output = accumulatedThickness_m;
                if (unitSystem == "english")
                {
                    xCoordHotSide_Output /= INCH_TO_M; // Convert meters to inches
                }
                else // metric-joules or metric-cal
                {
                    xCoordHotSide_Output /= CM_TO_M; // Convert meters to cm
                }
                result.GraphPoints.Add(new GraphPointDto { X = Math.Round(xCoordHotSide_Output, 2), Y = Math.Round(ConvertTempToOutputUnit(currentHotSideTemp_Calc, unitSystem), 2) });
                _logger.LogDebug("GraphPoint added: Layer {LayerNo} Hot Side - X={X}, Y={Y}", i + 1, Math.Round(xCoordHotSide_Output, 2), Math.Round(ConvertTempToOutputUnit(currentHotSideTemp_Calc, unitSystem), 2));

                // Update accumulated thickness for the cold side of the current layer
                accumulatedThickness_m += thickness_m;

                // Add point for the cold side of the current layer
                double xCoordColdSide_Output = accumulatedThickness_m;
                if (unitSystem == "english")
                {
                    xCoordColdSide_Output /= INCH_TO_M; // Convert meters to inches
                }
                else // metric-joules or metric-cal
                {
                    xCoordColdSide_Output /= CM_TO_M; // Convert meters to cm
                }
                result.GraphPoints.Add(new GraphPointDto { X = Math.Round(xCoordColdSide_Output, 2), Y = Math.Round(ConvertTempToOutputUnit(estimatedColdSideTemp_Calc, unitSystem), 2) });
                _logger.LogDebug("GraphPoint added: Layer {LayerNo} Cold Side - X={X}, Y={Y}", i + 1, Math.Round(xCoordColdSide_Output, 2), Math.Round(ConvertTempToOutputUnit(estimatedColdSideTemp_Calc, unitSystem), 2));
                // --- End Graph Points Generation ---

                currentHotSideTemp_Calc = estimatedColdSideTemp_Calc;
            }

            // --- Convection and Radiation at the Cold Face ---
            double h_total_cold_surface_SI = CalculateSurfaceHeatTransferCoefficient(
                input.ConvectionType,
                airVelocity_SI, // Air velocity is already in m/s
                input.Emissivity,
                input.SurfaceOrientation,
                lastLayerColdSideTemp_Calc,
                ambientTemp_SI
            );
            _logger.LogDebug("Calculated h_total_cold_surface_SI: {HTotalColdSurfaceSI} W/m²-K", h_total_cold_surface_SI);


            double totalOverallResistance;
            double heatLossPerM2_SI; // W/m^2
            double totalHeatLoss; // Declare totalHeatLoss here
            string totalHeatLossUnit; // Declare totalHeatLossUnit here

            if (input.SurfaceType == "Flat")
            {
                double surfaceResistance_per_area_SI = h_total_cold_surface_SI > 0 ? 1.0 / h_total_cold_surface_SI : 0; // m^2*K/W
                totalOverallResistance = totalConductiveResistance + surfaceResistance_per_area_SI; // Sum of m^2*K/W
                _logger.LogDebug("Flat Surface: TotalConductiveResistance={TotalConductiveResistance}, SurfaceResistancePerArea={SurfaceResistancePerArea}, TotalOverallResistance={TotalOverallResistance}",
                    totalConductiveResistance, surfaceResistance_per_area_SI, totalOverallResistance);

                if (totalOverallResistance <= 0 || double.IsInfinity(totalOverallResistance)) // Handle zero or infinite resistance
                {
                    heatLossPerM2_SI = 0;
                    _logger.LogWarning("Flat Surface: TotalOverallResistance is zero or infinite. HeatLossPerM2_SI set to 0.");
                }
                else
                {
                    heatLossPerM2_SI = (hotFaceTemp_SI - ambientTemp_SI) / totalOverallResistance; // W/m^2
                }


                if (input.SurfaceArea.HasValue)
                {
                    totalHeatLoss = heatLossPerM2_SI * surfaceArea_SI.Value; // Total Watts
                    totalHeatLoss = ConvertHeatLossToOutputUnit(totalHeatLoss, unitSystem, false); // Convert to W, BTU/hr, or kcal/hr
                    totalHeatLossUnit = GetTotalHeatLossUnit(unitSystem, false); // "W", "BTU/hr", "kcal/hr"
                }
                else
                {
                    totalHeatLoss = heatLossPerM2_SI; // Watts per square meter
                    totalHeatLoss = ConvertHeatLossToOutputUnit(totalHeatLoss, unitSystem, true); // Convert to W/m², BTU/hr-ft², or kcal/hr-m²
                    totalHeatLossUnit = GetTotalHeatLossUnit(unitSystem, true); // "W/m²", "BTU/hr-ft²", "kcal/hr-m²"
                }
            }
            else // Curved
            {
                double outerSurfaceArea_per_length_SI = 2 * Math.PI * lastLayerOuterRadius_m; // m^2 per meter length for a 1m cylinder
                double surfaceResistance_per_length_SI = h_total_cold_surface_SI > 0 ? 1.0 / (h_total_cold_surface_SI * outerSurfaceArea_per_length_SI) : 0; // K/W per meter length

                totalOverallResistance = totalConductiveResistance + surfaceResistance_per_length_SI; // Sum of K/W per meter length
                _logger.LogDebug("Curved Surface: TotalConductiveResistance={TotalConductiveResistance}, SurfaceResistancePerLength={SurfaceResistancePerLength}, TotalOverallResistance={TotalOverallResistance}",
                    totalConductiveResistance, surfaceResistance_per_length_SI, totalOverallResistance);

                double heatLossPerMeterLength_SI;
                if (totalOverallResistance <= 0 || double.IsInfinity(totalOverallResistance)) // Handle zero or infinite resistance
                {
                    heatLossPerMeterLength_SI = 0;
                    _logger.LogWarning("Curved Surface: TotalOverallResistance is zero or infinite. HeatLossPerMeterLength_SI set to 0.");
                }
                else
                {
                    heatLossPerMeterLength_SI = (hotFaceTemp_SI - ambientTemp_SI) / totalOverallResistance; // Watts per meter length
                }

                heatLossPerM2_SI = outerSurfaceArea_per_length_SI > 0 ? heatLossPerMeterLength_SI / outerSurfaceArea_per_length_SI : 0; // W/m^2 of outer surface

                if (input.SurfaceArea.HasValue)
                {
                    totalHeatLoss = heatLossPerM2_SI * surfaceArea_SI.Value; // Total Watts for the given surface area
                    totalHeatLoss = ConvertHeatLossToOutputUnit(totalHeatLoss, unitSystem, false); // Convert to W, BTU/hr, or kcal/hr
                    totalHeatLossUnit = GetTotalHeatLossUnit(unitSystem, false); // "W", "BTU/hr", "kcal/hr"
                }
                else
                {
                    totalHeatLoss = heatLossPerMeterLength_SI; // Watts per meter length
                    totalHeatLoss = ConvertHeatLossToOutputUnit(totalHeatLoss, unitSystem, true); // Convert to W/m, BTU/hr-ft, or kcal/hr-m
                    totalHeatLossUnit = GetTotalHeatLossUnit(unitSystem, true); // "W/m", "BTU/hr-ft", "kcal/hr-m"
                }
            }

            result.HeatLossPerM2 = Math.Round(ConvertHeatLossToOutputUnit(heatLossPerM2_SI, unitSystem, true), 2); // Always W/m², BTU/hr-ft², or kcal/hr-m²
            result.HeatLossPerM2Unit = GetHeatLossPerM2Unit(unitSystem);

            result.HeatStoragePerM2 = Math.Round(ConvertHeatStorageToOutputUnit(totalHeatStorage, unitSystem), 2);
            result.HeatStoragePerM2Unit = GetHeatStoragePerM2Unit(unitSystem);

            result.ColdFaceTemp = Math.Round(ConvertTempToOutputUnit(lastLayerColdSideTemp_Calc, unitSystem), 2);
            result.ColdFaceTempUnit = GetTempUnit(unitSystem);

            result.TotalHeatLoss = Math.Round(totalHeatLoss, 2);
            result.TotalHeatLossUnit = totalHeatLossUnit;

            // The LocatedDistance should now reflect the total accumulated thickness
            result.LocatedDistance = Math.Round(accumulatedThickness_m / GetLengthConversionFactor(unitSystem), 2);
            result.LocatedDistanceUnit = GetLengthUnit(unitSystem);

            return result;
        }

        /// <summary>
        /// Estimates the average thermal conductivity of a material based on temperature range.
        /// This method assumes kList provides conductivity values at 100, 200, ..., 700 °C (SI units).
        /// </summary>
        /// <param name="kList">List of conductivity values corresponding to temperature levels (W/m-K).</param>
        /// <param name="Thot">Hot side temperature of the layer (Celsius).</param>
        /// <param name="Tcold">Cold side temperature of the layer (Celsius).</param>
        /// <returns>Estimated average conductivity (W/m-K).</returns>
        private double EstimateAverageConductivity(List<double?> kList, double Thot, double Tcold)
        {
            double Tavg = (Thot + Tcold) / 2.0;
            _logger.LogDebug("EstimateAverageConductivity: Tavg={Tavg}C, kList={KList}", Tavg, string.Join(", ", kList.Select(k => k.ToString())));

            if (kList == null || kList.Count < 7)
            {
                _logger.LogWarning("EstimateAverageConductivity: kList is null or insufficient. Returning default 1.0 W/m-K.");
                return 1.0; // Default or error handling if data is insufficient
            }

            // Assuming kList corresponds to temperatures 100, 200, 300, 400, 500, 600, 700 °C
            var tempLevels = new List<int> { 100, 200, 300, 400, 500, 600, 700 };

            if (Tavg < tempLevels.First())
            {
                double k = kList.First() ?? 1.0;
                _logger.LogDebug("EstimateAverageConductivity: Tavg below first level. Returning k={K}", k);
                return k;
            }
            if (Tavg > tempLevels.Last())
            {
                double k = kList.Last() ?? 1.0;
                _logger.LogDebug("EstimateAverageConductivity: Tavg above last level. Returning k={K}", k);
                return k;
            }

            for (int i = 0; i < tempLevels.Count - 1; i++)
            {
                if (Tavg >= tempLevels[i] && Tavg <= tempLevels[i + 1])
                {
                    double k1 = kList[i] ?? 1.0;
                    double k2 = kList[i + 1] ?? 1.0;
                    double interpolatedK = k1 + (k2 - k1) * (Tavg - tempLevels[i]) / (tempLevels[i + 1] - tempLevels[i]);
                    _logger.LogDebug("EstimateAverageConductivity: Interpolating between {Temp1}C (k={K1}) and {Temp2}C (k={K2}). Interpolated k={InterpolatedK}",
                        tempLevels[i], k1, tempLevels[i + 1], k2, interpolatedK);
                    return interpolatedK;
                }
            }
            double lastK = kList.Last() ?? 1.0;
            _logger.LogWarning("EstimateAverageConductivity: Fallback to last k. This should not be reached if logic is sound. Returning k={K}", lastK);
            return lastK; // Should not be reached if logic is sound, but as a fallback
        }

        /// <summary>
        /// Provides placeholder thermal conductivity values for various gases at a given temperature.
        /// Values are in W/m·K (SI units).
        /// </summary>
        /// <param name="gasType">The type of gas (e.g., "Hydrogen 100%", "Nitrogen", "Argon").</param>
        /// <param name="temperature">The temperature in Celsius.</param>
        /// <returns>The thermal conductivity of the gas in W/m·K.</returns>
        private double GetGasThermalConductivity(string gasType, double temperature)
        {
            // These are simplified, fixed values for demonstration purposes.
            // Real gas thermal conductivity is temperature-dependent.
            switch (gasType)
            {
                case "Hydrogen 25%": return 0.05;
                case "Hydrogen 50%": return 0.09;
                case "Hydrogen 75%": return 0.14;
                case "Hydrogen 100%": return 0.18; // Pure Hydrogen
                case "Nitrogen": return 0.026;
                case "Argon": return 0.0177;
                case "Hydrogen X%": return 0.10; // Generic placeholder for 'X%'
                default:
                    _logger.LogWarning("Unknown gas type: {GasType}. Returning default 0.025 W/m-K (air-like).", gasType);
                    return 0.025; // Default to air-like conductivity if unknown gas type
            }
        }

        /// <summary>
        /// Provides placeholder density values for various gases at a given temperature.
        /// Values are in kg/m³ (SI units).
        /// </summary>
        /// <param name="gasType">The type of gas.</param>
        /// <param name="temperature">The temperature in Celsius.</param>
        /// <returns>The density of the gas in kg/m³.</returns>
        private double GetGasDensity(string gasType, double temperature)
        {
            // These are simplified, fixed values for demonstration purposes.
            // Real gas density is temperature and pressure dependent.
            // For a more accurate model, you'd use ideal gas law or look-up tables.
            switch (gasType)
            {
                case "Hydrogen 25%": return 0.08; // Placeholder for a blend
                case "Hydrogen 50%": return 0.06;
                case "Hydrogen 75%": return 0.04;
                case "Hydrogen 100%": return 0.08988; // Pure Hydrogen at STP (approx)
                case "Nitrogen": return 1.2506; // Nitrogen at STP (approx)
                case "Argon": return 1.784; // Argon at STP (approx)
                case "Hydrogen X%": return 0.5; // Generic placeholder
                default: return 1.225; // Default to air density at STP (approx)
            }
        }

        /// <summary>
        /// Provides placeholder specific heat values for various gases at a given temperature.
        /// Values are in kJ/kg·K (SI units).
        /// </summary>
        /// <param name="gasType">The type of gas.</param>
        /// <param name="temperature">The temperature in Celsius.</param>
        /// <returns>The specific heat of the gas in kJ/kg·K.</returns>
        private double GetGasSpecificHeat(string gasType, double temperature)
        {
            // These are simplified, fixed values for demonstration purposes.
            // Real gas specific heat is temperature dependent.
            switch (gasType)
            {
                case "Hydrogen 25%": return 10.0; // Placeholder for a blend
                case "Hydrogen 50%": return 11.5;
                case "Hydrogen 75%": return 12.8;
                case "Hydrogen 100%": return 14.30; // Pure Hydrogen (Cp at 25C)
                case "Nitrogen": return 1.04; // Nitrogen (Cp at 25C)
                case "Argon": return 0.52; // Argon (Cp at 25C)
                case "Hydrogen X%": return 5.0; // Generic placeholder
                default: return 1.006; // Default to air specific heat (Cp at 25C)
            }
        }


        /// <summary>
        /// Calculates the combined convective and radiative heat transfer coefficient from a surface to ambient.
        /// All inputs and outputs are in SI units (W/m²·K).
        /// </summary>
        /// <param name="convectionType">Type of convection ("Natural" or "Forced").</param>
        /// <param name="airVelocity">Air velocity in m/s (only for Forced convection).</param>
        /// <param name="emissivity">Surface emissivity (0 to 1).</param>
        /// <param name="surfaceOrientation">Orientation of the surface ("Wall", "Roof", "Floor").</param>
        /// <param name="surfaceTempC">Surface temperature in Celsius.</param>
        /// <param name="ambientTempC">Ambient temperature in Celsius.</param>
        /// <returns>Total heat transfer coefficient (convective + radiative) in W/m²·K.</returns>
        private double CalculateSurfaceHeatTransferCoefficient(
            string convectionType,
            double airVelocity,
            double emissivity,
            string surfaceOrientation,
            double surfaceTempC,
            double ambientTempC)
        {
            double h_convection;
            double deltaT = Math.Abs(surfaceTempC - ambientTempC);

            if (convectionType == "Natural")
            {
                switch (surfaceOrientation)
                {
                    case "Wall":
                        h_convection = 2.0 + (0.1 * deltaT);
                        if (h_convection < 2.0) h_convection = 2.0;
                        _logger.LogDebug("Natural convection on Wall. h_convection: {HConvection}", h_convection);
                        break;
                    case "Roof":
                        h_convection = 3.0 + (0.15 * deltaT);
                        if (h_convection < 3.0) h_convection = 3.0;
                        _logger.LogDebug("Natural convection on Roof. h_convection: {HConvection}", h_convection);
                        break;
                    case "Floor":
                        h_convection = 1.5 + (0.05 * deltaT);
                        if (h_convection < 1.5) h_convection = 1.5;
                        _logger.LogDebug("Natural convection on Floor. h_convection: {HConvection}", h_convection);
                        break;
                    default:
                        h_convection = 2.5 + (0.1 * deltaT);
                        if (h_convection < 2.5) h_convection = 2.5;
                        _logger.LogDebug("Natural convection (default). h_convection: {HConvection}", h_convection);
                        break;
                }
            }
            else // Forced convection
            {
                h_convection = 5.6 + 3.9 * airVelocity;
                _logger.LogDebug("Forced convection with Air Velocity: {AirVelocity} m/s. h_convection: {HConvection}", airVelocity, h_convection);
            }

            double surfaceTempK = surfaceTempC + C_TO_K;
            double ambientTempK = ambientTempC + C_TO_K;

            double h_radiation = 0;
            if (Math.Abs(surfaceTempK - ambientTempK) > 0.01)
            {
                h_radiation = emissivity * StefanBoltzmannConstant *
                              (surfaceTempK * surfaceTempK + ambientTempK * ambientTempK) *
                              (surfaceTempK + ambientTempK);
            }
            _logger.LogDebug("Emissivity: {Emissivity}, Surface Temp: {SurfaceTempC}C, Ambient Temp: {AmbientTempC}C. h_radiation: {HRadiation}", emissivity, surfaceTempC, ambientTempC, h_radiation);

            return h_convection + h_radiation;
        }

        // --- Unit Conversion Helper Methods ---

        /// <summary>
        /// Converts temperature from Celsius to the specified output unit.
        /// </summary>
        private double ConvertTempToOutputUnit(double tempC, string unitSystem)
        {
            switch (unitSystem)
            {
                case "english":
                    return tempC * C_TO_F_FACTOR + C_TO_F_OFFSET;
                case "metric-joules":
                case "metric-cal":
                default:
                    return tempC; // Already in Celsius
            }
        }

        /// <summary>
        /// Gets the temperature unit string for the specified unit system.
        /// </summary>
        private string GetTempUnit(string unitSystem)
        {
            switch (unitSystem)
            {
                case "english": return "°F";
                case "metric-joules":
                case "metric-cal":
                default: return "°C";
            }
        }

        /// <summary>
        /// Converts heat loss from W (SI) to the specified output unit.
        /// The `isPerAreaOrLengthDefault` parameter indicates if the input `heatLoss_SI` is actually a rate per unit area (W/m²) or per unit length (W/m)
        /// when `SurfaceArea` was not provided in the input.
        /// </summary>
        /// <param name="heatLoss_SI">Heat loss in Watts (W), W/m², or W/m.</param>
        /// <param name="unitSystem">Target unit system.</param>
        /// <param name="isPerAreaOrLengthDefault">True if the original input SurfaceArea was null, meaning heatLoss_SI is W/m² (flat) or W/m (curved). False if SurfaceArea was provided, meaning heatLoss_SI is total W.</param>
        private double ConvertHeatLossToOutputUnit(double heatLoss_SI, string unitSystem, bool isPerAreaOrLengthDefault)
        {
            switch (unitSystem)
            {
                case "english":
                    if (isPerAreaOrLengthDefault)
                    {
                        // If it's W/m² (flat) or W/m (curved) and SurfaceArea was null
                        // For flat: W/m² to BTU/hr-ft²
                        // For curved: W/m to BTU/hr-ft
                        return heatLoss_SI / BTU_PER_HR_TO_W / (isPerAreaOrLengthDefault && heatLoss_SI == heatLoss_SI / (2 * Math.PI * 1) ? 1 : SQFT_TO_SQM); // This is complex, simplify.
                                                                                                                                                               // The `isPerAreaOrLengthDefault` already tells us if it's a "per unit" value.
                                                                                                                                                               // The `GetTotalHeatLossUnit` handles the distinction.
                                                                                                                                                               // If it's W/m², convert to BTU/hr-ft². If it's W/m, convert to BTU/hr-ft.
                                                                                                                                                               // The current implementation of heatLoss_SI is already either W/m², W/m, or W.
                                                                                                                                                               // So, we just need to convert the value.
                        return heatLoss_SI / BTU_PER_HR_TO_W; // This converts W, W/m, W/m2 to BTU/hr, BTU/hr-ft, BTU/hr-ft2 respectively.
                    }
                    else
                    {
                        // heatLoss_SI is total Watts, convert to BTU/hr
                        return heatLoss_SI / BTU_PER_HR_TO_W;
                    }
                case "metric-cal":
                    if (isPerAreaOrLengthDefault)
                    {
                        // heatLoss_SI is W/m² or W/m, convert to kcal/hr-m² or kcal/hr-m
                        return heatLoss_SI * 3600 / KCAL_TO_J;
                    }
                    else
                    {
                        // heatLoss_SI is total Watts, convert to kcal/hr
                        return heatLoss_SI * 3600 / KCAL_TO_J;
                    }
                case "metric-joules":
                default:
                    return heatLoss_SI; // Already in W, W/m², or W/m
            }
        }

        /// <summary>
        /// Gets the heat loss per square meter unit string for the specified unit system.
        /// </summary>
        private string GetHeatLossPerM2Unit(string unitSystem)
        {
            switch (unitSystem)
            {
                case "english": return "BTU/hr-ft²";
                case "metric-cal": return "kcal/hr-m²";
                case "metric-joules":
                default: return "W/m²";
            }
        }

        /// <summary>
        /// Gets the total heat loss unit string for the specified unit system and whether SurfaceArea was provided.
        /// </summary>
        /// <param name="unitSystem">Target unit system.</param>
        /// <param name="isPerAreaOrLengthDefault">True if SurfaceArea was NOT provided, meaning TotalHeatLoss represents W/m² (flat) or W/m (curved). False if SurfaceArea WAS provided, meaning TotalHeatLoss is total W.</param>
        private string GetTotalHeatLossUnit(string unitSystem, bool isPerAreaOrLengthDefault)
        {
            if (isPerAreaOrLengthDefault)
            {
                // If SurfaceArea is NOT provided, TotalHeatLoss represents a rate per unit area or length
                if (unitSystem == "english")
                {
                    // For flat: BTU/hr-ft²; For curved: BTU/hr-ft
                    // This distinction needs to be made based on SurfaceType, which is not passed here.
                    // For simplicity in this helper, I'll return the per-area unit.
                    // The calling code in AnalyzeHeatLossAsync will need to handle the curved "W/m" case.
                    return "BTU/hr-ft²";
                }
                else if (unitSystem == "metric-cal")
                {
                    return "kcal/hr-m²";
                }
                else // metric-joules or default
                {
                    return "W/m²";
                }
            }
            else
            {
                // If SurfaceArea IS provided, TotalHeatLoss is always total power
                switch (unitSystem)
                {
                    case "english": return "BTU/hr";
                    case "metric-cal": return "kcal/hr";
                    case "metric-joules":
                    default: return "W";
                }
            }
        }


        /// <summary>
        /// Converts heat storage from kJ/m² (SI) to the specified output unit.
        /// </summary>
        private double ConvertHeatStorageToOutputUnit(double heatStorage_kJ_per_m2_SI, string unitSystem)
        {
            switch (unitSystem)
            {
                case "english":
                    // kJ/m² to BTU/ft²
                    // kJ/m² * (1000 J / 1 kJ) * (1 BTU / 1055.06 J) * (1 m² / 10.7639 ft²) = BTU/ft²
                    return heatStorage_kJ_per_m2_SI * 1000 / BTU_TO_J / SQFT_TO_SQM;
                case "metric-cal":
                    // kJ/m² to kcal/m²
                    return heatStorage_kJ_per_m2_SI / (KCAL_TO_J / 1000.0);
                case "metric-joules":
                default:
                    return heatStorage_kJ_per_m2_SI; // Already in kJ/m²
            }
        }

        /// <summary>
        /// Gets the heat storage per square meter unit string for the specified unit system.
        /// </summary>
        private string GetHeatStoragePerM2Unit(string unitSystem)
        {
            switch (unitSystem)
            {
                case "english": return "BTU/ft²";
                case "metric-cal": return "kcal/m²";
                case "metric-joules":
                default: return "kJ/m²";
            }
        }

        /// <summary>
        /// Gets the length unit string for the specified unit system.
        /// </summary>
        private string GetLengthUnit(string unitSystem)
        {
            switch (unitSystem)
            {
                case "english": return "inches";
                case "metric-joules":
                case "metric-cal":
                default: return "cm"; // Assuming cm is the default for metric input thickness
            }
        }

        /// <summary>
        /// Gets the conversion factor to convert meters to the specified length unit.
        /// E.g., if unitSystem is "english", returns INCH_TO_M (0.0254) so that meters / INCH_TO_M = inches.
        /// </summary>
        private double GetLengthConversionFactor(string unitSystem)
        {
            switch (unitSystem)
            {
                case "english": return INCH_TO_M;
                case "metric-joules":
                case "metric-cal":
                default: return CM_TO_M; // To convert meters to cm, divide by CM_TO_M (0.01)
            }
        }
    }
}
