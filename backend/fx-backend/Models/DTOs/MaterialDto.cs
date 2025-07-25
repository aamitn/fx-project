namespace fx_backend.Models.DTOs
{
    public class MaterialDto
    {
        public int Id { get; set; }
        public string MaterialType { get; set; } = string.Empty; //Name
        public string Manufacturer { get; set; } = string.Empty;
        public string ProductClass { get; set; } = string.Empty;
        public double MaxTemperatureLimit { get; set; }
        public double Density { get; set; }
        public double SpecificHeat { get; set; }
        public List<double?> Conductivities { get; set; } = new();
    }
}
