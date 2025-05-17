using System.Collections.Generic;
using Microsoft.EntityFrameworkCore;
using fx_backend.Data;

namespace fx_backend.Services
{
    public class MaterialService
    {
        private readonly AppDbContext _dbContext;

        public MaterialService(AppDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        
        // Method to get all material types from the database
        public async Task<List<string>> GetAllMaterialTypesAsync()
        {
            return await _dbContext.Materials
                .Select(m => m.MaterialType)
                .Distinct()
             // .OrderBy(m => _dbContext.Materials.FirstOrDefault(x => x.MaterialType == m)!.Id) // Order by db id and not alphabetic order
                .ToListAsync();
        }
        
        // Method to get specific heat of a material by its type
        public async Task<double?> GetSpecificHeatAsync(string materialType)
        {
            // EF-ORM query to fetch specific heat from the database
            //var material = await _dbContext.Materials.FirstOrDefaultAsync ( m => m.MaterialType == materialType );

            // Consider case-insensitive search
            /* 
            var material = await _dbContext.Materials.FirstOrDefaultAsync(
                 m => EF.Functions.Like( m.MaterialType, materialType.ToLower() )
                 ); */

            // Consider case-insensitive search and removing spaces
            var material = await _dbContext.Materials.FirstOrDefaultAsync(
                m => EF.Functions.Like(m.MaterialType.Replace(" ", ""), materialType.Replace(" ", "").ToLower())
            );


            return material?.SpecificHeat;
        }
    }
}