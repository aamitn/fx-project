using fx_backend.Models.DTOs;
using fx_backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("api/[controller]")]
public class MaterialController : ControllerBase
{
    private readonly MaterialService _materialService;

    public MaterialController(MaterialService materialService)
    {
        _materialService = materialService;
    }

    //Create Material
    [HttpPost]
    public async Task<IActionResult> AddMaterial([FromBody] MaterialDto dto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var addedMaterial = await _materialService.AddMaterialAsync(dto);
        return CreatedAtAction(nameof(GetMaterialById), new { id = addedMaterial.Id }, addedMaterial);
    }

    // Optional: for CreatedAtAction to work
    [HttpGet("{id}")]
    public async Task<IActionResult> GetMaterialById(int id)
    {
        var material = await _materialService.GetMaterialByIdAsync(id); // you can add this in service if not present
        if (material == null)
            return NotFound();

        return Ok(material);
    }

    // Get all materials data
    [HttpGet("data")]
    public async Task<IActionResult> GetAllMaterials()
    {
        var materials = await _materialService.GetAllMaterialsAsync();
        return Ok(materials);
    }

    //Delete Material by Id
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteMaterial(int id)
    {
        var deleted = await _materialService.DeleteMaterialAsync(id);
        if (!deleted)
        {
            return NotFound(new { message = $"Material with ID {id} not found." });
        }

        return Ok(new { message = "Material deleted successfully." });
    }

    // New endpoint to delete multiple materials by a list of IDs
    [HttpDelete("bulk")] //  route: DELETE /api/material/bulk
    public async Task<IActionResult> DeleteMaterials([FromBody] List<int> ids)
    {
        if (ids == null || !ids.Any())
        {
            return BadRequest(new { message = "No material IDs provided for deletion." });
        }

        var deletedCount = await _materialService.DeleteMaterialsAsync(ids);

        if (deletedCount == 0)
        {
            // If deletedCount is 0, it means no materials were found for the provided IDs
            return NotFound(new { message = "No materials found matching the provided IDs for deletion." });
        }
        else if (deletedCount < ids.Count)
        {
            // If some but not all materials were deleted
            return Ok(new { message = $"{deletedCount} of {ids.Count} materials deleted successfully. Some IDs might not have been found." });
        }
        else
        {
            // All materials were deleted successfully
            return Ok(new { message = $"{deletedCount} materials deleted successfully." });
        }
    }

    // Update Material by Id
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateMaterial(int id, [FromBody] MaterialDto dto)
    {
        // Check if the provided DTO is null or invalid
        if (dto == null)
        {
            return BadRequest(new { message = "Invalid material data." });
        }

        var updated = await _materialService.UpdateMaterialAsync(id, dto);

        if (!updated)
        {
            return NotFound(new { message = $"Material with ID {id} not found." });
        }

        return Ok(new { message = "Material updated successfully." });
    }



    /// <summary>
    /// Uploads material data from an Excel file, replacing all existing material data. availbale  to admin users
    /// </summary>
    /// <param name="file">The Excel file to upload.</param>
    /// <returns>A response indicating success or failure.</returns>
    /// 

    [HttpPost("upload-excel")] // Route: POST /api/Material/upload-excel
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> UploadExcel(IFormFile file)
    {
        if (file == null || file.Length == 0)
        {
            return BadRequest(new { message = "No file uploaded or file is empty." });
        }

        if (!file.FileName.EndsWith(".xlsx", StringComparison.OrdinalIgnoreCase) &&
            !file.FileName.EndsWith(".xls", StringComparison.OrdinalIgnoreCase))
        {
            return BadRequest(new { message = "Invalid file type. Only .xlsx or .xls files are allowed." });
        }

        try
        {
            using (var stream = file.OpenReadStream())
            {
                var importedCount = await _materialService.UploadMaterialsFromExcelAsync(stream);
                return Ok(new { message = $"{importedCount} materials imported successfully. All previous materials have been replaced." });
            }
        }
        catch (InvalidOperationException ex) // Catch specific exceptions from service if needed
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            // Log the full exception details
            Console.Error.WriteLine($"[MaterialController] Error during Excel upload: {ex}");
            return StatusCode(500, new { message = "An error occurred during file upload and processing.", details = ex.Message });
        }
    }



}
