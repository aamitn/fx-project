// fx_backend/Models/Project.cs
using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema; // Add this if not already present

namespace fx_backend.Models
{
    public class Project
    {
        [Key]
        public string Id { get; set; } = Guid.NewGuid().ToString(); // Generate ID on creation
        [Required]
        public string Name { get; set; } = string.Empty;
        [Required]
        public string UserId { get; set; } = string.Empty;

        // Stores the complex project data as a JSON string
        // You can add [Column(TypeName = "jsonb")] for PostgreSQL or similar for other DBs
        // if you want to use native JSON column types for better querying/indexing.
        // For general EF Core, string is sufficient and handles serialization in code.
        public string Data { get; set; } = "{}"; // Default to empty JSON object

        public DateTime LastModified { get; set; } = DateTime.UtcNow; // Auto-set modification time

        // Navigation property for the user (optional, but good for relationships)
        public ApplicationUser User { get; set; } = null!;
    }
}