// This DTO will be used for creating both normal and admin users
using System.ComponentModel.DataAnnotations;

namespace fx_backend.Models.DTOs.UserManagement
{
    public class UserCreateDto
    {
        [Required]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;

        [Required]
        [StringLength(100, MinimumLength = 6)]
        public string Password { get; set; } = string.Empty;

        public string? FullName { get; set; }

        [Required]
        public string Role { get; set; } = "User"; // Default to "User", but can be "Admin"
    }
}

// fx_backend.Models.DTOs/UserManagement/UserUpdateDto.cs
// This DTO will be used for editing user profiles and roles
namespace fx_backend.Models.DTOs.UserManagement
{
    public class UserUpdateDto
    {
        // Personal info
        public string? FullName { get; set; }
        public string? Organization { get; set; }
        public string? JobTitle { get; set; }
        public string? Country { get; set; }

        // Password change (optional, only if both are provided)
        public string? NewPassword { get; set; }

        // Role management (optional, for adding/removing roles)
        public List<string>? Roles { get; set; }
    }
}

// fx_backend.Models.DTOs/UserManagement/UserListDto.cs
// This DTO will be used for returning user information in the list endpoint
namespace fx_backend.Models.DTOs.UserManagement
{
    public class UserListDto
    {
        public string Id { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string? FullName { get; set; }
        public bool EmailConfirmed { get; set; }
        public bool TwoFactorEnabled { get; set; }
        public DateTime? RegisteredAt { get; set; } // Assuming you have this property
        public List<string> Roles { get; set; } = new List<string>();

        // Additional fields you might have in ApplicationUser
        public string? Organization { get; set; }
        public string? JobTitle { get; set; }
        public string? Country { get; set; }
    }
}