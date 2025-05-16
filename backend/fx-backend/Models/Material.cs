namespace fx_backend.Models
{
    public class Material
    {
        public int Id { get; set; }
        public required string MaterialType { get; set; } // Material type (e.g., "Water", "Iron")
        public double SpecificHeat { get; set; } // Specific heat (Cp)
    }
}