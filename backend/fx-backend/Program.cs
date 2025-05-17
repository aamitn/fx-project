using fx_backend.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.OpenApi.Models;


var builder = WebApplication.CreateBuilder(args);

// Add WebAPI services to the container.
builder.Services.AddControllers();
builder.Services.AddOpenApi(); // Learn more about configuring OpenAPI : https://aka.ms/aspnet/openapi

//Swagger configuration
builder.Services.AddSwaggerGen(c =>
{
    // Basic Info
    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "FurnX API",
        Version = "v1",
        Description = "FurnXpert Insulation Calculation API",
        Contact = new OpenApiContact
        {
            Name = "Bimtutex Technologies",
            Email = "support@bitmutex.com",
            Url = new Uri("https://bitmutex.com")
        }
    });

});


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
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "FurnX API V1");
        c.RoutePrefix = "api-docs";
        c.DocumentTitle = "FurnX API Documentation";
    });
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
