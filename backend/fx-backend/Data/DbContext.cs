using Microsoft.EntityFrameworkCore;
using fx_backend.Models;

namespace fx_backend.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<Material> Materials { get; set; } // Materials table


        // Add some initial data during to db model creation
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            // specific heat values for common materials in units of J/g°C
            modelBuilder.Entity<Material>().HasData(
                new Material { Id = 1, MaterialType = "Water", SpecificHeat = 4.184 },
                new Material { Id = 2, MaterialType = "Wood", SpecificHeat = 1.76 },
                new Material { Id = 3, MaterialType = "Glass", SpecificHeat = 0.84 },
                new Material { Id = 4, MaterialType = "Silica", SpecificHeat = 0.83 }
            );
        }
    }
}