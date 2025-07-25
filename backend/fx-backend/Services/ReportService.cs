using fx_backend.Data;
using fx_backend.Models;
using fx_backend.Models.DTOs;
using fx_backend.Utils;
using System;
using System.Linq;

namespace fx_backend.Services
{
    public class ReportService
    {
        private readonly AppDbContext _dbContext;

        public ReportService(AppDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        public byte[] GenerateHeatQuantityPdf(HeatReportRequestDto dto)
        {
            byte[]? imageBytes = null;

            if (!string.IsNullOrEmpty(dto.Base64Image))
            {
                try
                {
                    imageBytes = Convert.FromBase64String(dto.Base64Image);
                }
                catch (FormatException)
                {
                    // Optionally log or handle malformed base64 input
                }
            }

            // Fetch and log or enrich material details for each layer
            foreach (var layer in dto.Layers)
            {
                var material = _dbContext.Materials
                    .FirstOrDefault(m => m.MaterialType == layer.Product);

                if (material != null)
                {
                    // You can now use material.Density, material.SpecificHeat, etc.

                    // Optionally enrich the layer or log a warning if needed
                    if (layer.MaxLimitTemp > material.MaxTemperatureLimit)
                    {
                        layer.LimitExceeded = true;
                    }

                    // Optional: attach other properties to layer if you add them to DTO
                }
                else
                {
                    // Handle case: material not found in DB
                    Console.WriteLine($"Warning: Material not found for product: {layer.Product}");
                }
            }

            return ReportGenerator.GenerateHeatQuantityPdf(dto, imageBytes);
        }
    }
}
