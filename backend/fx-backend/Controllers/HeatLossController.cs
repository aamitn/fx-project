using fx_backend.Models.DTOs;
using fx_backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;

namespace fx_backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
   // [Authorize] // Require JWT token for all actions in this controller
    public class HeatLossController : ControllerBase
    {
        private readonly HeatLossService _heatLossService;
        private readonly ILogger<HeatLossController> _logger;

        public HeatLossController(HeatLossService heatLossService, ILogger<HeatLossController> logger)
        {
            _heatLossService = heatLossService;
            _logger = logger;
        }

        [HttpPost("analyze")]
        public async Task<ActionResult<HeatLossResultDto>> AnalyzeHeatLoss([FromBody] HeatLossInputDto input)
        {
            try
            {
                var result = await _heatLossService.AnalyzeHeatLossAsync(input);
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "An error occurred while analyzing heat loss.");
                return BadRequest(ex.Message);
            }
        }
    }
}
