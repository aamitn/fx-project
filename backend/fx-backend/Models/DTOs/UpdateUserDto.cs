// fx_backend/Models/DTOs/UpdateUserDto.cs
using System.ComponentModel.DataAnnotations;

namespace fx_backend.Models.DTOs
{
    public class UpdateUserDto
    {
        // FullName is optional for update
        public string? FullName { get; set; }

        // OldPassword is required if NewPassword is provided for validation
        public string? OldPassword { get; set; }

        // NewPassword must meet minimum length requirements if provided
        [MinLength(6, ErrorMessage = "New password must be at least 6 characters long.")]
        public string? NewPassword { get; set; }

        public string? Organization { get; set; }

        public string? JobTitle { get; set; }

        public string? Country { get; set; }
    }
}