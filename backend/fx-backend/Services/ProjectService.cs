// fx_backend/Services/ProjectService.cs
using fx_backend.Data;
using fx_backend.Models;
using fx_backend.Models.DTOs;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json; // For JSON serialization/deserialization
using System.Threading.Tasks;
using static fx_backend.Models.DTOs.InsulationPreviewDto; // This line might be redundant if InsulationPreviewDto is in the same namespace

namespace fx_backend.Services
{
    public class ProjectService
    {
        private readonly AppDbContext _context;

        public ProjectService(AppDbContext context)
        {
            _context = context;
        }

        // Helper to get default project content JSON
        private static string GetDefaultProjectContentJson()
        {
            var defaultContent = new ProjectContentDto
            {
                InsulationDetails = new InsulationDetailsDto
                {
                    SystemApplication = "Tank Shell - Horizontal",
                    DimensionalConstruction = "Even Increment",
                    Thickness = "0",
                    // New fields with default values
                    UnitSystem = "Metric",
                    Location = "",
                    Equipment = "",
                    Customer = "",
                    EngineerInitial = "",
                    Date = DateTime.UtcNow.Date, // Only date part
                    CalcPerPage = 10
                },
                InsulationLayers = new List<ProjectInsulationLayerDto> // Changed type
                {
                    new ProjectInsulationLayerDto // Changed name
                    {
                        Id = Guid.NewGuid().ToString(), // Generate unique ID for default layer
                        Type = "Insulation 1",
                        Name = "Select Material",
                        Thickness = "50",
                        Color = "#ADD8E6"
                    }
                },
                Calculations = new CalculationsDto
                {
                    SelectedTabs = new List<string> { "heat-loss" },
                    CalculationResults = new Dictionary<string, object>()
                },
                InsulationPreview = new InsulationPreviewDto
                {
                    ModelHeight = 60,
                    ModelWidth = 200,
                    ModelDepth = 20,
                    ZoomLevel = 100
                }
            };
            // Use JsonSerializer to convert DTO to JSON string
            return JsonSerializer.Serialize(defaultContent);
        }

        public async Task<ProjectListMetaDto?> CreateProjectAsync(string projectName, string userId)
        {
            var newProject = new Project
            {
                Id = Guid.NewGuid().ToString(), // Ensure ID is generated here
                Name = projectName,
                UserId = userId,
                Data = GetDefaultProjectContentJson(), // Initialize with default content JSON
                LastModified = DateTime.UtcNow
            };

            _context.Projects.Add(newProject);
            await _context.SaveChangesAsync();

            // Return ProjectListMetaDto as expected by frontend's createProjectInDb
            return new ProjectListMetaDto
            {
                Id = newProject.Id,
                Name = newProject.Name,
                LastModified = newProject.LastModified
            };
        }

        public async Task<List<ProjectListMetaDto>> GetAllProjectsAsync(string userId)
        {
            return await _context.Projects
                .Where(p => p.UserId == userId)
                .Select(p => new ProjectListMetaDto
                {
                    Id = p.Id,
                    Name = p.Name,
                    LastModified = p.LastModified
                })
                .OrderByDescending(p => p.LastModified) // Order for sidebar display
                .ToListAsync();
        }

        public async Task<ProjectFullDataDto?> GetProjectByIdAsync(string projectId, string userId)
        {
            var project = await _context.Projects
                .Where(p => p.Id == projectId && p.UserId == userId)
                .FirstOrDefaultAsync();

            if (project == null)
            {
                return null;
            }

            // Deserialize the JSON string Data into ProjectContentDto
            var projectContent = JsonSerializer.Deserialize<ProjectContentDto>(project.Data);

            return new ProjectFullDataDto
            {
                Id = project.Id,
                Name = project.Name,
                LastModified = project.LastModified,
                Data = projectContent ?? new ProjectContentDto() // Ensure Data is never null
            };
        }

        public async Task<bool> UpdateProjectAsync(UpdateProjectRequestDto updateDto, string userId)
        {
            var project = await _context.Projects
                .Where(p => p.Id == updateDto.Id && p.UserId == userId)
                .FirstOrDefaultAsync();

            if (project == null)
            {
                return false;
            }

            // Map flattened DTO content back to ProjectContentDto for serialization
            var contentToSave = new ProjectContentDto
            {
                InsulationDetails = updateDto.InsulationDetails,
                InsulationLayers = updateDto.InsulationLayers, // This will now expect ProjectInsulationLayerDto
                Calculations = updateDto.Calculations,
                InsulationPreview = updateDto.InsulationPreview
            };

            project.Name = updateDto.Name;
            project.Data = JsonSerializer.Serialize(contentToSave); // Serialize updated content
            project.LastModified = DateTime.UtcNow; // Update modification timestamp

            _context.Projects.Update(project);
            await _context.SaveChangesAsync();

            return true;
        }

        public async Task<bool> DeleteProjectAsync(string projectId, string userId)
        {
            var project = await _context.Projects
                .Where(p => p.Id == projectId && p.UserId == userId)
                .FirstOrDefaultAsync();

            if (project == null)
            {
                return false;
            }

            _context.Projects.Remove(project);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}