using fx_backend.Models.DTOs;
using fx_backend.Services;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Threading.Tasks;

[ApiController]
[Route("api/[controller]")]
public class ReportController : ControllerBase
{
    private readonly MaterialService _materialService;
    private readonly ReportService _reportService;

    public ReportController(MaterialService materialService, ReportService reportService)
    {
        _materialService = materialService;
        _reportService = reportService;
    }

    [HttpPost("generate")]
    public async Task<IActionResult> GenerateReport([FromBody] HeatReportRequestDto request)
    {
        try
        {
            // Generate PDF using the updated DTO
            byte[] pdfBytes = _reportService.GenerateHeatQuantityPdf(request);

            return File(pdfBytes, "application/pdf", "HeatQuantityReport.pdf");
        }
        catch (Exception ex)
        {
            Console.WriteLine(ex);
            return StatusCode(500, "Failed to generate PDF report.");
        }
    }
}
