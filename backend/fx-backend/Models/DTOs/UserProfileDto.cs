// fx_backend/Models/DTOs/UserProfileDto.cs
using System.ComponentModel.DataAnnotations;

namespace fx_backend.Models.DTOs
{
    public class UserProfileDto
    {
        public string Id { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string FullName { get; set; } = string.Empty;

        [MaxLength(100)]
        public string? Organization { get; set; } = string.Empty;

        [MaxLength(100)]
        public string? JobTitle { get; set; } = string.Empty;

        [MaxLength(100)]
        public string? Country { get; set; } = string.Empty;

    }
}