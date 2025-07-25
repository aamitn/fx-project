// fx_backend/Controllers/UserController.cs
using fx_backend.Models;
using fx_backend.Models.DTOs.UserManagement; // For the new DTOs
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore; // For .ToListAsync()
using System.Collections.Generic; // For List<string>
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;

namespace fx_backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Admin")] // All actions in this controller require Admin role
    public class UsersController : ControllerBase
    {
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly RoleManager<IdentityRole> _roleManager; // Needed to check if roles exist
        private readonly ILogger<UsersController> _logger;

        public UsersController(
            UserManager<ApplicationUser> userManager,
            RoleManager<IdentityRole> roleManager,
            ILogger<UsersController> logger)
        {
            _userManager = userManager;
            _roleManager = roleManager;
            _logger = logger;
        }

        // 1. Get all user info from user table
        [HttpGet]
        public async Task<ActionResult<IEnumerable<UserListDto>>> GetAllUsers()
        {
            var users = await _userManager.Users.ToListAsync();
            var userDtos = new List<UserListDto>();

            foreach (var user in users)
            {
                var roles = await _userManager.GetRolesAsync(user);
                userDtos.Add(new UserListDto
                {
                    Id = user.Id,
                    Email = user.Email ?? string.Empty,
                    FullName = user.FullName,
                    EmailConfirmed = user.EmailConfirmed,
                    TwoFactorEnabled = user.TwoFactorEnabled,
                    RegisteredAt = user.RegisteredAt, // Ensure ApplicationUser has this property
                    Roles = roles.ToList(),
                    Organization = user.Organization, // Ensure ApplicationUser has these properties
                    JobTitle = user.JobTitle,
                    Country = user.Country
                });
            }

            return Ok(userDtos);
        }

        // 2. Delete user
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteUser(string id)
        {
            var user = await _userManager.FindByIdAsync(id);
            if (user == null)
            {
                return NotFound($"User with ID '{id}' not found.");
            }

            // Prevent self-deletion if the admin is trying to delete their own account
            if (User.FindFirstValue(ClaimTypes.NameIdentifier) == id)
            {
                return BadRequest("You cannot delete your own account via this endpoint.");
            }

            var result = await _userManager.DeleteAsync(user);
            if (!result.Succeeded)
            {
                _logger.LogError("Failed to delete user {UserId}: {@Errors}", id, result.Errors);
                return BadRequest($"Failed to delete user: {string.Join(", ", result.Errors.Select(e => e.Description))}");
            }

            _logger.LogInformation("User {UserId} deleted by admin {AdminId}", id, User.FindFirstValue(ClaimTypes.NameIdentifier));
            return NoContent(); // 204 No Content for successful deletion
        }

        // 3. Edit user (only fields that are possible/feasible to edit)
        [HttpPut("{id}")]
        public async Task<IActionResult> EditUser(string id, [FromBody] UserUpdateDto dto)
        {
            var user = await _userManager.FindByIdAsync(id);
            if (user == null)
            {
                return NotFound($"User with ID '{id}' not found.");
            }

            bool changed = false;

            // Update FullName
            if (dto.FullName != null && user.FullName != dto.FullName)
            {
                user.FullName = dto.FullName;
                changed = true;
            }
            // Update Organization
            if (dto.Organization != null && user.Organization != dto.Organization)
            {
                user.Organization = dto.Organization;
                changed = true;
            }
            // Update JobTitle
            if (dto.JobTitle != null && user.JobTitle != dto.JobTitle)
            {
                user.JobTitle = dto.JobTitle;
                changed = true;
            }
            // Update Country
            if (dto.Country != null && user.Country != dto.Country)
            {
                user.Country = dto.Country;
                changed = true;
            }

            // Change Password (Admin sets new password, no old password required)
            if (!string.IsNullOrEmpty(dto.NewPassword))
            {
                // Remove existing password hash (if any) and set new one
                var removePasswordResult = await _userManager.RemovePasswordAsync(user);
                if (!removePasswordResult.Succeeded && removePasswordResult.Errors.Any(e => e.Code != "PasswordNotSet"))
                {
                    _logger.LogError("Failed to remove old password for user {UserId}: {@Errors}", user.Id, removePasswordResult.Errors);
                    return BadRequest($"Failed to update password: {string.Join(", ", removePasswordResult.Errors.Select(e => e.Description))}");
                }

                var addPasswordResult = await _userManager.AddPasswordAsync(user, dto.NewPassword);
                if (!addPasswordResult.Succeeded)
                {
                    _logger.LogError("Failed to add new password for user {UserId}: {@Errors}", user.Id, addPasswordResult.Errors);
                    return BadRequest($"Failed to update password: {string.Join(", ", addPasswordResult.Errors.Select(e => e.Description))}");
                }
                changed = true;
            }

            // Update User Roles
            if (dto.Roles != null)
            {
                var currentRoles = await _userManager.GetRolesAsync(user);
                var rolesToRemove = currentRoles.Except(dto.Roles).ToList();
                var rolesToAdd = dto.Roles.Except(currentRoles).ToList();

                if (rolesToRemove.Any())
                {
                    var removeResult = await _userManager.RemoveFromRolesAsync(user, rolesToRemove);
                    if (!removeResult.Succeeded)
                    {
                        _logger.LogError("Failed to remove roles for user {UserId}: {@Errors}", user.Id, removeResult.Errors);
                        return BadRequest($"Failed to remove roles: {string.Join(", ", removeResult.Errors.Select(e => e.Description))}");
                    }
                    changed = true;
                }

                if (rolesToAdd.Any())
                {
                    // Validate if roles being added actually exist in RoleManager
                    var nonExistentRoles = new List<string>();
                    foreach (var roleName in rolesToAdd)
                    {
                        if (!await _roleManager.RoleExistsAsync(roleName))
                        {
                            nonExistentRoles.Add(roleName);
                        }
                    }

                    if (nonExistentRoles.Any())
                    {
                        return BadRequest($"Attempted to add non-existent roles: {string.Join(", ", nonExistentRoles)}");
                    }

                    var addResult = await _userManager.AddToRolesAsync(user, rolesToAdd);
                    if (!addResult.Succeeded)
                    {
                        _logger.LogError("Failed to add roles for user {UserId}: {@Errors}", user.Id, addResult.Errors);
                        return BadRequest($"Failed to add roles: {string.Join(", ", addResult.Errors.Select(e => e.Description))}");
                    }
                    changed = true;
                }
            }

            if (changed)
            {
                var updateResult = await _userManager.UpdateAsync(user);
                if (!updateResult.Succeeded)
                {
                    _logger.LogError("Failed to update user {UserId}: {@Errors}", user.Id, updateResult.Errors);
                    return BadRequest($"Failed to update user: {string.Join(", ", updateResult.Errors.Select(e => e.Description))}");
                }
                _logger.LogInformation("User {UserId} updated by admin {AdminId}", user.Id, User.FindFirstValue(ClaimTypes.NameIdentifier));
                return Ok(new { message = "User updated successfully." });
            }

            return Ok(new { message = "No changes were made to the user." });
        }

        // 4. & 5. Create new admin user / Create new normal user (combined)
        [HttpPost]
        public async Task<IActionResult> CreateUser([FromBody] UserCreateDto dto)
        {
            // Validate the role
            if (!await _roleManager.RoleExistsAsync(dto.Role))
            {
                return BadRequest($"Role '{dto.Role}' does not exist.");
            }

            var user = new ApplicationUser
            {
                UserName = dto.Email,
                Email = dto.Email,
                FullName = dto.FullName,
                EmailConfirmed = true, // Admins typically create confirmed users
                RegisteredAt = DateTime.UtcNow // Set registration timestamp
            };

            var result = await _userManager.CreateAsync(user, dto.Password);
            if (!result.Succeeded)
            {
                _logger.LogWarning("Admin user creation failed for {Email}: {@Errors}", dto.Email, result.Errors);
                return BadRequest($"User creation failed: {string.Join(", ", result.Errors.Select(e => e.Description))}");
            }

            // Assign the specified role
            var roleResult = await _userManager.AddToRoleAsync(user, dto.Role);
            if (!roleResult.Succeeded)
            {
                _logger.LogError("Failed to assign role '{Role}' to new user {Email}: {@Errors}", dto.Role, user.Email, roleResult.Errors);
                // Clean up the user if role assignment fails
                await _userManager.DeleteAsync(user);
                return StatusCode(500, $"Failed to assign role '{dto.Role}': {string.Join(", ", roleResult.Errors.Select(e => e.Description))}");
            }

            // If an admin creates an 'Admin' user, they should also implicitly be in the 'User' role
            if (dto.Role == "Admin" && await _roleManager.RoleExistsAsync("User"))
            {
                if (!await _userManager.IsInRoleAsync(user, "User"))
                {
                    var addUserRoleResult = await _userManager.AddToRoleAsync(user, "User");
                    if (!addUserRoleResult.Succeeded)
                    {
                        _logger.LogWarning("Failed to add 'User' role to new Admin user {Email}: {@Errors}", user.Email, addUserRoleResult.Errors);
                        // This is a warning, not a critical failure for admin creation, but good to log
                    }
                }
            }
            else if (dto.Role == "User" && !await _roleManager.RoleExistsAsync("User"))
            {
                _logger.LogWarning("Attempted to create 'User' role user, but 'User' role does not exist in DB.");
            }


            _logger.LogInformation("User {Email} created with role '{Role}' by admin {AdminId}", dto.Email, dto.Role, User.FindFirstValue(ClaimTypes.NameIdentifier));
            return CreatedAtAction(nameof(GetAllUsers), new { id = user.Id }, new { message = $"User '{user.Email}' created successfully with role '{dto.Role}'." });
        }
    }
}