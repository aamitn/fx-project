// fx_backend/Models/DTOs/HeatLossInputDto.cs
namespace fx_backend.Models.DTOs
{
    public class HeatLossInputDto
    {
        // Primary Inputs
        public string AnalysisNo { get; set; } = string.Empty;
        public int NumberOfRefLayers { get; set; }
        public string SurfaceOrientation { get; set; } = string.Empty;
        public double? SurfaceArea { get; set; } // in m² - NOW OPTIONAL
        public string SurfaceName { get; set; } = string.Empty;

        // Unit System
        public string? Unit { get; set; } //  "English", "Metric Joules", "Metric-Cal"

        // Surface Type
        public string SurfaceType { get; set; } = "Flat"; // or "Curved"
        public double? InsideRadius { get; set; } // in cm (only if Curved)

        // Operating Parameters
        public bool IncludeFreezePlane { get; set; }
        public string ConvectionType { get; set; } = "Natural"; // or "Forced"
        public double AirVelocity { get; set; } // m/s
        public double Emissivity { get; set; }
        public double AmbientTemp { get; set; } // °C
        public double HotFaceTemp { get; set; } // °C
        public bool PorousGas { get; set; }
        public string? GasType { get; set; } // New: Gas Type for porous materials
        public double? FreezePlaneTemp { get; set; } // °C (optional)

        // Layer Info: List of Insulation Layers (from Hot Face to Cold Face)
        public List<InsulationLayerDto> Layers { get; set; } = new();
    }

    public class InsulationLayerDto
    {
        public int No { get; set; }
        public string MaterialName { get; set; } = string.Empty;
        public double Thickness { get; set; } // cm
    }

    public class HeatLossResultDto
    {
        // Temp Results per layer
        public List<LayerResultDto> TemperatureResults { get; set; } = new();

        // Final Heat Results
        public double HeatLossPerM2 { get; set; } // W/m² or BTU/hr-ft² or kcal/hr-m²
        public string HeatLossPerM2Unit { get; set; } = "W/m²"; // Unit for HeatLossPerM2

        public double HeatStoragePerM2 { get; set; } // kJ/m² or BTU/ft² or kcal/m²
        public string HeatStoragePerM2Unit { get; set; } = "kJ/m²"; // Unit for HeatStoragePerM2

        public double ColdFaceTemp { get; set; } // °C or °F
        public string ColdFaceTempUnit { get; set; } = "°C"; // Unit for ColdFaceTemp

        public double TotalHeatLoss { get; set; } // Watts or BTU/hr or kcal/hr (or W/m, BTU/hr-ft, kcal/hr-m)
        public string TotalHeatLossUnit { get; set; } = "W"; // Unit for TotalHeatLoss

        public double LocatedDistance { get; set; } // cm or inches or meters
        public string LocatedDistanceUnit { get; set; } = "cm"; // Unit for LocatedDistance

        public List<GraphPointDto> GraphPoints { get; set; } = new();
    }

    public class LayerResultDto
    {
        public int No { get; set; }
        public double HeatStorage { get; set; } // kJ/m² or BTU/ft² or kcal/m²
        public double HotSideTemp { get; set; } // °C or °F
        public double ColdSideTemp { get; set; } // °C or °F
    }
}

public class GraphPointDto
{
    public double X { get; set; } // Distance, cm or inches or meters
    public double Y { get; set; } // Temperature, °C or °F
}
