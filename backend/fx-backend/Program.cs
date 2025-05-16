using fx_backend.Data;
using Microsoft.EntityFrameworkCore;


var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers();
builder.Services.AddOpenApi(); // Learn more about configuring OpenAPI : https://aka.ms/aspnet/openapi

// Use MS-SQL Server as the database provider
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection"))); 

// Register MaterialService
builder.Services.AddScoped<fx_backend.Services.MaterialService>();

// Add CORS services
builder.Services.AddCors(options =>
{
    options.AddPolicy("MyCorsPolicy", builder =>
    {
        builder.WithOrigins(
		"http://localhost:8080",
		"https://furnx.bitmutex.com"
		)
               .AllowAnyHeader()
               .AllowAnyMethod();
    });
});

// Instantiate with the builder pattern
var app = builder.Build();


// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();

// Enable routing
app.UseRouting();

// Add the CORS middleware here, after UseRouting
app.UseCors("MyCorsPolicy");

app.UseAuthorization();

app.MapControllers();

await app.RunAsync();
