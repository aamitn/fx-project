using fx_backend.Models;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace fx_backend.Data
{
    public class AppDbContext : IdentityDbContext<ApplicationUser>
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<Material> Materials { get; set; } // Materials table
        public DbSet<Project> Projects { get; set; } // Projects Table


        // Add some initial data during to db model creation
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Configure the relationship between ApplicationUser and Project
            modelBuilder.Entity<Project>()
                .HasOne(p => p.User)
                .WithMany() // Or .WithMany(u => u.Projects) if you add a Projects navigation property to ApplicationUser
                .HasForeignKey(p => p.UserId)
                .IsRequired()
                .OnDelete(DeleteBehavior.Cascade); // Cascade delete projects if user is deleted


            modelBuilder.Entity<Material>().HasData(
                new Material
                {
                    Id = 1,
                    MaterialType = "B & W SR 99 (3300F)",
                    Manufacturer = "B & W",
                    ProductClass = "Firebrick",
                    MaxTemperatureLimit = 1815,
                    Density = 3059.82,
                    SpecificHeat = 1026, // J/kg·K (converted from 1.026 kJ/kg·K)
                    Conductivity1 = 6.8495,
                    Conductivity2 = 6.8495,
                    Conductivity3 = 0,
                    Conductivity4 = 0,
                    Conductivity5 = 0,
                    Conductivity6 = 0,
                    Conductivity7 = 0,
                },
                new Material
                {
                    Id = 2,
                    MaterialType = "B & W 80",
                    Manufacturer = "B & W",
                    ProductClass = "Firebrick",
                    MaxTemperatureLimit = 1538,
                    Density = 2226.78,
                    SpecificHeat = 1026,
                    Conductivity1 = 2.3072,
                    Conductivity2 = 2.4514,
                    Conductivity3 = 2.5956,
                    Conductivity4 = 0,
                    Conductivity5 = 0,
                    Conductivity6 = 0,
                    Conductivity7 = 0,
                },
                new Material
                {
                    Id = 3,
                    MaterialType = "H-W Superduty Alamo",
                    Manufacturer = "Harbison Walker",
                    ProductClass = "Firebrick",
                    MaxTemperatureLimit = 1427,
                    Density = 2338.92,
                    SpecificHeat = 1026,
                    Conductivity1 = 1.2834,
                    Conductivity2 = 1.2834,
                    Conductivity3 = 1.3411,
                    Conductivity4 = 1.3987,
                    Conductivity5 = 0,
                    Conductivity6 = 0,
                    Conductivity7 = 0,
                },
                new Material
                {
                    Id = 4,
                    MaterialType = "AP Green Empire Hi Duty",
                    Manufacturer = "AP Green",
                    ProductClass = "Firebrick",
                    MaxTemperatureLimit = 1371,
                    Density = 2098.62,
                    SpecificHeat = 1026,
                    Conductivity1 = 0.9806,
                    Conductivity2 = 0.9806,
                    Conductivity3 = 1.1248,
                    Conductivity4 = 1.2690,
                    Conductivity5 = 1.4420,
                    Conductivity6 = 0,
                    Conductivity7 = 0,
                }
            );
        }
    }
}