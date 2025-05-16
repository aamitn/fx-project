using Microsoft.AspNetCore.Mvc;

using fx_backend.Models;
using fx_backend.Services;

namespace fx_backend.Controllers
{
    [ApiController]
    // [Route("api/[controller]")]  // Set baseroute to api/HeatQuantity with default controller name
    [Route("api/heat-quantity")]  // Set baseroute to api/heat-quantity with custom name
    public class HeatQuantityController : ControllerBase
    {
        
        // Dependency injection for MaterialService
        private readonly MaterialService _materialService;

        public HeatQuantityController(MaterialService materialService)
        {
            _materialService = materialService;
        }

        // private const double Cp = 4.18; // Mean specific heat constant used in old ver

        // GET handler at baseroute
        [HttpGet]
        public IActionResult Get()
        {
            return Ok(new
            {
                Message = "HeatQuantity API is running. Use POST /api/HeatQuantity/calculate to calculate heat quantity.",
                ExampleRequest = new
                {
                    Mass = 5,
                    InitialTemperature = 20,
                    FinalTemperature = 80,
                    MaterialType = "Water"
                }
            });
        }


        // POST handler at baseroute/calculate
        [HttpPost("calculate")]
        public async Task<ActionResult<HeatQuantityResponse>> CalculateHeatQuantity([FromBody] HeatQuantityRequest request)
        {
            try
            {
                if (request.Mass <= 0)
                {
                    return BadRequest("Mass must be greater than zero.");
                }

                //Get Specific Heat of the material from DB using the MaterialService
                var specificHeat = await _materialService.GetSpecificHeatAsync(request.MaterialType);
                if (specificHeat == null)
                {
                    return NotFound($"Material type '{request.MaterialType}' not found.");
                }

                double specificHeatValue = specificHeat.Value; // Explicitly get the value after the null check
                double deltaT = request.FinalTemperature - request.InitialTemperature; // ∆T = T2 - T1
                double heatQuantity = request.Mass * specificHeatValue * deltaT; // Q = mCp∆T

                return Ok(new HeatQuantityResponse { HeatQuantity = heatQuantity });
            }
            catch (Exception ex)
            {   // Generic handler to console and  API response
                Console.WriteLine(ex);
                return StatusCode(500, "Oops! Something went wrong, we dont know what");
            }
        }
    }
}