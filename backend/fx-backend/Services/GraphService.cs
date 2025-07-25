using fx_backend.Models.DTOs;
using fx_backend.Utils;

namespace fx_backend.Services
{
    public class GraphService
    {
        public byte[] GenerateTemperaturePlot(List<GraphPointDto> points, List<string>? layerLabels = null)
        {
            return GraphPlotter.GenerateTemperaturePlot(points, layerLabels);
        }
    }
}
