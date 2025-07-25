using fx_backend.Controllers;
using fx_backend.Data;
using fx_backend.Models;
using fx_backend.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Diagnostics.HealthChecks;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Diagnostics.HealthChecks;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using OfficeOpenXml;
using System.Security.Claims;
using System.Text;
using System.Threading.RateLimiting;
using Microsoft.AspNetCore.Diagnostics.HealthChecks;
using System.Text.Json;

var builder = WebApplication.CreateBuilder(args);
var dbConnectionString = builder.Configuration.GetConnectionString("WinAuthConnection");

// --- 0. Configure ExcelPackage License Context ---
ExcelPackage.License.SetNonCommercialOrganization("Bitmutex");

// --- 1. Add DbContext with Identity support ---
builder.Services.AddDbContext<AppDbContext> ( options =>
    options.UseSqlServer (dbConnectionString) );

// --- Health Checks Configuration (NEW SECTION) ---
builder.Services.AddHealthChecks()
    // Health check for SQL Server database
    // It uses the DbContext connection string to check connectivity
    .AddSqlServer(
        connectionString: dbConnectionString,
        healthQuery: "SELECT 1;",
        name: "DB",
        failureStatus: HealthStatus.Degraded,
        tags: ["db", "sql", "sqlserver"])

    // Basic application health check (always healthy if the app is running)
    .AddCheck("API", () => HealthCheckResult.Healthy("API is running and responsive."), tags: new[] { "api", "live" });



// --- 2. Add Identity ---
builder.Services.AddIdentity<ApplicationUser, IdentityRole>()
    .AddEntityFrameworkStores<AppDbContext>()
    .AddDefaultTokenProviders()
    .AddTokenProvider<EmailTokenProvider<ApplicationUser>>("Email") // Custom email token provider
    .AddTokenProvider<AuthenticatorTokenProvider<ApplicationUser>>("Authenticator"); // For authenticator app

// Configure Identity options
builder.Services.Configure<IdentityOptions>(options =>
{
    // Password settings
    options.Password.RequireDigit = true;
    options.Password.RequireLowercase = true;
    options.Password.RequireUppercase = true;
    options.Password.RequireNonAlphanumeric = true;
    options.Password.RequiredLength = 6;
    options.Password.RequiredUniqueChars = 1;

    // Lockout settings
    options.Lockout.DefaultLockoutTimeSpan = TimeSpan.FromMinutes(5);
    options.Lockout.MaxFailedAccessAttempts = 5;
    options.Lockout.AllowedForNewUsers = true;

    // User settings
    options.User.RequireUniqueEmail = true;

    // Enable/Disbale Email Confirmation
    options.SignIn.RequireConfirmedEmail = true;
});


// --- 3. Add JWT Authentication ---
var jwtSettings = builder.Configuration.GetSection("JwtSettings");
var secretKey = jwtSettings["SecretKey"];
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.SaveToken = true;
    options.RequireHttpsMetadata = false; // Change to true in production
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = jwtSettings["Issuer"],
        ValidAudience = jwtSettings["Audience"],
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey)),
        RoleClaimType = ClaimTypes.Role
    };
});


// --- 4. Add Google Authentication ---
builder.Services.AddAuthentication(options =>
{
    options.DefaultScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
    .AddGoogle(options =>
    {
        options.ClientId = builder.Configuration["Authentication:Google:ClientId"]!;
        options.ClientSecret = builder.Configuration["Authentication:Google:ClientSecret"]!;
        options.CallbackPath = builder.Configuration["Authentication:Google:CallbackPath"]!; // Ensure this matches your redirect URI
    });

// --- 4. Add Controllers ---
builder.Services.AddControllers().AddJsonOptions(options =>
{
    options.JsonSerializerOptions.NumberHandling = System.Text.Json.Serialization.JsonNumberHandling.AllowNamedFloatingPointLiterals;
});

// --- 5. Add Swagger + JWT Support ---
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "FurnX API",
        Version = "v1",
        Description = "FurnXpert Insulation Analysis API",
        Contact = new OpenApiContact
        {
            Name = "FurnXpert Backend",
            Email = "support@furnxpert.com",
            Url = new Uri("https://furnxpert.com")
        }
    });

    // Swagger JWT Auth Header
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "JWT Authorization header using the Bearer scheme. Example: `Bearer {token}`",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });

    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type=ReferenceType.SecurityScheme,
                    Id="Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

// --- 6. Register Custom Services ---
builder.Services.AddScoped<MaterialService>();
builder.Services.AddScoped<ReportService>();
builder.Services.AddScoped<GraphService>();
builder.Services.AddScoped<HeatLossService>();
builder.Services.AddScoped<EmailService>();
builder.Services.AddScoped<ProjectService>(); // Register ProjectService

// --- 7. CORS ---
builder.Services.AddCors(options =>
{
    options.AddPolicy("MyCorsPolicy", builder =>
    {
        builder.WithOrigins(  //FRONTEND Urls that are allowed to access the API
            "http://localhost:8080",
            "http://localhost:4173",
            "http://sknandi-001-site2.jtempurl.com"
        )
        .AllowAnyHeader()
        .AllowAnyMethod()
        .AllowCredentials()
        ;
    });
});


// --- 8. Rate Limiter ---
builder.Services.AddRateLimiter(options => // Registers the rate limiting services with dependency injection.
{
    // Defines a rate limiting policy named "fixed" (for Fixed Window Rate Limiting)
    options.AddPolicy("fixed", httpContext => // 'httpContext' allows access to the current request details
    {
        return RateLimitPartition.GetFixedWindowLimiter(
            partitionKey: httpContext.Connection.RemoteIpAddress?.ToString(),
            factory: _ => new FixedWindowRateLimiterOptions // Configuration for this specific fixed window limiter
            {
                PermitLimit = 20, // Maximum number of requests allowed within the window
                Window = TimeSpan.FromMinutes(1), // The time duration of the window (e.g., 1 minute)
                QueueProcessingOrder = QueueProcessingOrder.OldestFirst, // How queued requests are processed (oldest first)
                QueueLimit = 5 // Maximum number of requests that can be queued if the limit is hit
            });
    });

    // Defines a rate limiting policy named "sliding" (for Sliding Window Rate Limiting)
    options.AddPolicy("sliding", httpContext => // 'httpContext' allows access to the current request details
    {
        return RateLimitPartition.GetSlidingWindowLimiter(
            partitionKey: httpContext.Connection.RemoteIpAddress?.ToString(),
            factory: _ => new SlidingWindowRateLimiterOptions // Configuration for this specific sliding window limiter
            {
                PermitLimit = 100, // Maximum number of requests allowed within the window
                Window = TimeSpan.FromMinutes(1), // The total time duration of the window
                SegmentsPerWindow = 10, // The window is divided into 10 segments. Requests are counted across these segments.
                                        // This provides a smoother rate limiting than fixed window.
                QueueProcessingOrder = QueueProcessingOrder.OldestFirst, // How queued requests are processed
                QueueLimit = 5 // Maximum number of requests that can be queued
            });
    });
});


// --- 9. Build App ---
var app = builder.Build();

// Default basic health check (all checks)
app.MapHealthChecks("/health", new HealthCheckOptions
{
    ResponseWriter = async (context, report) =>
    {
        context.Response.ContentType = "application/json";

        var result = JsonSerializer.Serialize(new
        {
            status = report.Status.ToString(),
            results = report.Entries.ToDictionary(
                e => e.Key,
                e => new {
                    status = e.Value.Status.ToString(),
                    description = e.Value.Description ?? "No description",
                    exception = e.Value.Exception?.Message,
                    tags = e.Value.Tags
                })
        });

        await context.Response.WriteAsync(result);
    }
});

// Health check only for database
app.MapHealthChecks("/health/db", new HealthCheckOptions
{
    Predicate = check => check.Tags.Contains("db")
});

// Health check only for the app self-check
app.MapHealthChecks("/health/live", new HealthCheckOptions
{
    Predicate = check => check.Tags.Contains("live")
});

// --- 10. Middleware ---
app.UseSwagger();
app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "FurnX API V1");
    c.RoutePrefix = string.Empty;
    c.DocumentTitle = "FurnX API Documentation";
});

app.UseRouting();

app.UseCors("MyCorsPolicy");

app.UseAuthentication(); // << IMPORTANT
app.UseAuthorization();

app.MapControllers();

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    db.Database.Migrate(); // Optional
    await IdentitySeeder.SeedDefaultUserAsync(scope.ServiceProvider);
}

await app.RunAsync();
