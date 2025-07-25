namespace fx_backend.Models
{
    public class Material
    {
        public int Id { get; set; }

        // Core Material Identity
        public required string MaterialType { get; set; }       // Name 'Product' (e.g., "B & W SR 99 (3300F)")
        public string Manufacturer { get; set; } = string.Empty;
        public string ProductClass { get; set; } = string.Empty; // e.g., Firebrick, Board, Castable

        // Physical Properties
        public double MaxTemperatureLimit { get; set; }         // In °C (or °F if English unit)
        public double Density { get; set; }                     // In kg/m³
        public double SpecificHeat { get; set; }                // In J/kg·K

        // Thermal Conductivity at Various Temperatures
        public double? Conductivity1 { get; set; }              // e.g., at 100°C
        public double? Conductivity2 { get; set; }
        public double? Conductivity3 { get; set; }
        public double? Conductivity4 { get; set; }
        public double? Conductivity5 { get; set; }
        public double? Conductivity6 { get; set; }
        public double? Conductivity7 { get; set; }

    }
}
