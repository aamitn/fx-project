using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;

namespace fx_backend.Models.DTOs
{
    public class HeatReportRequestDto
    {
        // Image Data
        public string? Base64Image { get; set; }

        // Surface and Assumption Data
        public string SurfaceName { get; set; } = string.Empty;
        public double HotSideTemp { get; set; }
        public double AmbientTemp { get; set; }
        public double Velocity { get; set; }
        public double Emissivity { get; set; }
        public double? FreezePlaneTemp { get; set; }
        public double Area { get; set; }

        // Layers
        public List<HeatLayerDto> Layers { get; set; } = new();

        // Results
        public double ColdFaceTemp { get; set; }
        public double HeatLoss { get; set; }
        public double TotalHeatLoss { get; set; }
        public double FreezePlaneDepth { get; set; }
    }

    public class HeatLayerDto
    {
        public int LayerNumber { get; set; }
        public double Thickness { get; set; }
        public string Product { get; set; } = string.Empty;
        public double MaxLimitTemp { get; set; }
        public double HotSideTemp { get; set; }
        public double ColdSideTemp { get; set; }
        public bool LimitExceeded { get; set; }
    }


}
