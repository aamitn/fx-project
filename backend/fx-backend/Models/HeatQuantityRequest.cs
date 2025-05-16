namespace fx_backend.Models
{
    public class HeatQuantityRequest
    {
        public double Mass { get; set; } // m: Mass of the material
        public double InitialTemperature { get; set; } // T1: Initial temperature
        public double FinalTemperature { get; set; } // T2: Final temperature
        public required string MaterialType { get; set; } // Material type (e.g., "Water", "Iron")

    }

    public class HeatQuantityResponse
    {
        public double HeatQuantity { get; set; } // Q: Calculated heat quantity
        public string Unit { get; set; } = "Joule (J)"; // Set a default value as Joule
    }
}