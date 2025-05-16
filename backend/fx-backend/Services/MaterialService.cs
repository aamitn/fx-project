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
                m => EF.Functions.Like( m.MaterialType.Replace(" ", "") , materialType.Replace(" ", "").ToLower() )
            );


            return material?.SpecificHeat;
        }
    }
}