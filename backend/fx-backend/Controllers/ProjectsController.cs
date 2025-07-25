// fx_backend/Controllers/ProjectsController.cs
using fx_backend.Models;
using fx_backend.Models.DTOs;

using fx_backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;

namespace fx_backend.Controllers
{
    [Authorize] // Ensure only authenticated users can access
    [Route("api/[controller]")]
    [ApiController]
    public class ProjectsController : ControllerBase
    {
        private readonly ProjectService _projectService;
        private readonly UserManager<ApplicationUser> _userManager;

        public ProjectsController(ProjectService projectService, UserManager<ApplicationUser> userManager)
        {
            _projectService = projectService;
            _userManager = userManager;
        }

        private async Task<string> GetCurrentUserId()
        {
            // Get the current authenticated user's ID
            var user = await _userManager.GetUserAsync(User);
            return user?.Id ?? throw new System.UnauthorizedAccessException("User not found or unauthorized.");
        }

        // GET: api/Projects
        [HttpGet]
        public async Task<ActionResult<IEnumerable<ProjectListMetaDto>>> GetProjects()
        {
            var userId = await GetCurrentUserId();
            var projects = await _projectService.GetAllProjectsAsync(userId);
            return Ok(projects);
        }

        // GET: api/Projects/5
        [HttpGet("{id}")]
        public async Task<ActionResult<ProjectFullDataDto>> GetProject(string id)
        {
            var userId = await GetCurrentUserId();
            var project = await _projectService.GetProjectByIdAsync(id, userId);

            if (project == null)
            {
                return NotFound();
            }

            return Ok(project);
        }

        // POST: api/Projects
        // Creates a new project with default content and returns its metadata
        [HttpPost]
        public async Task<ActionResult<ProjectListMetaDto>> CreateProject(CreateProjectRequestDto requestDto)
        {
            var userId = await GetCurrentUserId();
            var newProjectMeta = await _projectService.CreateProjectAsync(requestDto.Name, userId);

            if (newProjectMeta == null)
            {
                return BadRequest("Could not create project.");
            }

            // Return 201 Created with the new project's metadata and a Location header
            return CreatedAtAction(nameof(GetProject), new { id = newProjectMeta.Id }, newProjectMeta);
        }

        // PUT: api/Projects/5
        // Updates an existing project with full content data
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateProject(string id, UpdateProjectRequestDto updateDto)
        {
            if (id != updateDto.Id)
            {
                return BadRequest("Project ID mismatch.");
            }

            var userId = await GetCurrentUserId();
            var result = await _projectService.UpdateProjectAsync(updateDto, userId);

            if (!result)
            {
                return NotFound();
            }

            return NoContent(); // 204 No Content for successful update
        }

        // DELETE: api/Projects/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteProject(string id)
        {
            var userId = await GetCurrentUserId();
            var result = await _projectService.DeleteProjectAsync(id, userId);

            if (!result)
            {
                return NotFound();
            }

            return NoContent(); // 204 No Content for successful deletion
        }
    }
}