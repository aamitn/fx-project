using fx_backend.Models;
using Microsoft.AspNetCore.Identity;

public static class IdentitySeeder
{
    public static async Task SeedDefaultUserAsync(IServiceProvider serviceProvider)
    {
        using var scope = serviceProvider.CreateScope();
        var userManager = scope.ServiceProvider.GetRequiredService<UserManager<ApplicationUser>>();
        var roleManager = scope.ServiceProvider.GetRequiredService<RoleManager<IdentityRole>>();

        string defaultEmail = "admin@example.com"; // valid email preferred
        string defaultPassword = "1234qwerT$"; // uppercase,lowercase, number, special char

        // Ensure roles exist
        string[] roles = new[] { "Admin", "User" };
        foreach (var role in roles)
        {
            if (!await roleManager.RoleExistsAsync(role))
            {
                await roleManager.CreateAsync(new IdentityRole(role));
            }
        }

        // Create the default admin user if it doesn't exist
        var adminUser = await userManager.FindByEmailAsync(defaultEmail);
        if (adminUser == null)
        {
            adminUser = new ApplicationUser
            {
                UserName = defaultEmail,
                Email = defaultEmail,
                EmailConfirmed = true,
                FullName = "Admin User", 
                RegisteredAt = DateTime.UtcNow
            };

            var result = await userManager.CreateAsync(adminUser, defaultPassword);
            if (!result.Succeeded)
            {
                throw new Exception($"Default user creation failed: {string.Join(", ", result.Errors.Select(e => e.Description))}");
            }
        }

        // Assign the "Admin" role to the user if not already assigned
        var rolesForUser = await userManager.GetRolesAsync(adminUser);
        if (!rolesForUser.Contains("Admin"))
        {
            await userManager.AddToRoleAsync(adminUser, "Admin");
        }
    }
}
