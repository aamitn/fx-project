using fx_backend.Models.DTOs;
using fx_backend.Utils;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;

namespace fx_backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class GraphController : ControllerBase
    {
        private readonly ILogger<GraphController> _logger;

        public GraphController(ILogger<GraphController> logger)
        {
            _logger = logger;
        }

        [HttpPost("plot")]
        public IActionResult GeneratePlot([FromBody] List<GraphPointDto> points)
        {
            try
            {
                if (points == null || !points.Any())
                    return BadRequest("No data points provided.");

                var imageBytes = GraphPlotter.GenerateTemperaturePlot(points);

                return File(imageBytes, "image/png", "temperature_plot.png");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to generate plot.");
                return StatusCode(500, "Failed to generate temperature plot.");
            }
        }
    }
}
