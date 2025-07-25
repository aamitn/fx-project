using Microsoft.AspNetCore.Identity;
using System.ComponentModel.DataAnnotations;

namespace fx_backend.Models
{
    public class ApplicationUser : IdentityUser
    {
        [Required]
        [MaxLength(100)]
        public string FullName { get; set; } = default!;

        [Required]
        [EmailAddress]
        public override string? Email { get; set; } = default!;

        [MaxLength(100)]
        public string? Organization { get; set; }

        [MaxLength(100)]
        public string? JobTitle { get; set; }

        [MaxLength(100)]
        public string? Country { get; set; }

        public string? ProfileImageUrl { get; set; }

        [Required]
        public DateTime RegisteredAt { get; set; } = DateTime.UtcNow;

        public bool IsActive { get; set; } = true;

        public string? GoogleId { get; set; }
    }
}
