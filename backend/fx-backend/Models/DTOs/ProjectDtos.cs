// fx_backend/Models/DTOs/ProjectDtos.cs

using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace fx_backend.Models.DTOs
{
    // Nested DTOs for ProjectContent
    public class InsulationDetailsDto
    {
        public string SystemApplication { get; set; } = "Tank Shell - Horizontal";
        public string DimensionalConstruction { get; set; } = "Even Increment";
        public string Thickness { get; set; } = "0";

        public string UnitSystem { get; set; } = "Metric"; // Default value
        public string Location { get; set; } = string.Empty;
        public string Equipment { get; set; } = string.Empty;
        public string Customer { get; set; } = string.Empty;
        public string EngineerInitial { get; set; } = string.Empty;
        public DateTime Date { get; set; } = DateTime.UtcNow.Date; // Store only date part
        public int CalcPerPage { get; set; } = 10; // Default value
    }

    // Renamed from InsulationLayerDto
    public class ProjectInsulationLayerDto // Changed name
    {
        public string Id { get; set; } = Guid.NewGuid().ToString(); // Frontend generates IDs
        public string Type { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string Thickness { get; set; } = string.Empty;
        public string Color { get; set; } = string.Empty;
    }

    public class CalculationsDto
    {
        public List<string> SelectedTabs { get; set; } = new List<string>();
        public Dictionary<string, object> CalculationResults { get; set; } = new Dictionary<string, object>(); // Can be dynamic
    }

    public class InsulationPreviewDto
    {
        public int ModelHeight { get; set; }
        public int ModelWidth { get; set; }
        public int ModelDepth { get; set; }
        public int ZoomLevel { get; set; }
    }

    // This DTO represents the full content stored in the Project.Data JSON field
    // MOVED OUT OF InsulationPreviewDto
    public class ProjectContentDto
    {
        public InsulationDetailsDto InsulationDetails { get; set; } = new InsulationDetailsDto();
        public List<ProjectInsulationLayerDto> InsulationLayers { get; set; } = new List<ProjectInsulationLayerDto>();
        public CalculationsDto Calculations { get; set; } = new CalculationsDto();
        public InsulationPreviewDto InsulationPreview { get; set; } = new InsulationPreviewDto();
    }

    // DTO for listing projects (metadata only) - Matches frontend's ProjectListMeta
    // MOVED OUT OF InsulationPreviewDto
    public class ProjectListMetaDto
    {
        public string Id { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public DateTime LastModified { get; set; }
    }

    // DTO for fetching a single project (full data) - Matches frontend's ProjectFullData
    // MOVED OUT OF InsulationPreviewDto
    public class ProjectFullDataDto
    {
        public string Id { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public DateTime LastModified { get; set; }
        public ProjectContentDto Data { get; set; } = new ProjectContentDto(); // Matches frontend's ProjectFullData.data
    }

    // DTO for creating a new project - Matches frontend's createProjectInDb request
    // MOVED OUT OF InsulationPreviewDto
    public class CreateProjectRequestDto
    {
        [Required]
        [MinLength(1)]
        public string Name { get; set; } = string.Empty;
    }

    // DTO for updating an existing project - Matches frontend's ProjectSaveDataToBackend
    // Note: All content properties are flattened here, as per frontend's PUT request
    // MOVED OUT OF InsulationPreviewDto
    public class UpdateProjectRequestDto
    {
        [Required]
        public string Id { get; set; } = string.Empty; // Project ID for the route
        [Required]
        [MinLength(1)]
        public string Name { get; set; } = string.Empty;

        // Flattened content properties from ProjectContentDto
        public InsulationDetailsDto InsulationDetails { get; set; } = new InsulationDetailsDto();
        public List<ProjectInsulationLayerDto> InsulationLayers { get; set; } = new List<ProjectInsulationLayerDto>();
        public CalculationsDto Calculations { get; set; } = new CalculationsDto();
        public InsulationPreviewDto InsulationPreview { get; set; } = new InsulationPreviewDto();
    }
}