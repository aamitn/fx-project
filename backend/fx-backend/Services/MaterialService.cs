using fx_backend.Data;
using fx_backend.Models;
using fx_backend.Models.DTOs;
using Microsoft.EntityFrameworkCore;
using SkiaSharp;
using System.Collections.Generic;
using System.IO; //  Stream
using OfficeOpenXml; //  EPPlus / Excel parsing

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
                .GroupBy(m => m.MaterialType)
                .Select(g => new { MaterialType = g.Key, MinId = g.Min(m => m.Id) })
                //.OrderBy(g => g.MinId)       // Use this to sort by ID
                .OrderBy(g => g.MaterialType) // Use this to sort alphabetically
                .Select(g => g.MaterialType)
                .ToListAsync();
        }

        public async Task<Material?> GetMaterialByTypeAsync(string materialType)
        {
            Console.WriteLine($"[GetMaterialByTypeAsync] Looking for material: '{materialType}'");

            var normalizedInput = Normalize(materialType);

            var materials = await _dbContext.Materials.ToListAsync();

            var match = materials.FirstOrDefault(m =>
                Normalize(m.MaterialType) == normalizedInput);

            if (match == null)
            {
                Console.WriteLine("[GetMaterialByTypeAsync] No matching material found.");
            }
            else
            {
                Console.WriteLine($"[GetMaterialByTypeAsync] Found: {match.MaterialType}");
            }

            return match;
        }

        private string Normalize(string s)
        {
            return string.Concat(s.Where(c => !char.IsWhiteSpace(c))).ToLower();
        }

        // Method to get specific heat of a material by its type         // Get Specific Heat
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


        // Get Density
        public async Task<double?> GetDensityAsync(string materialType)
        {
            Console.WriteLine($"[GetDensityAsync] Requested density for: '{materialType}'");
            var material = await GetMaterialByTypeAsync(materialType);
            return material?.Density;
        }

        // Get Max Temperature Limit
        public async Task<double?> GetMaxTemperatureLimitAsync(string materialType)
        {
            var material = await GetMaterialByTypeAsync(materialType);
            return material?.MaxTemperatureLimit;
        }

        // Get Manufacturer
        public async Task<string?> GetManufacturerAsync(string materialType)
        {
            var material = await GetMaterialByTypeAsync(materialType);
            return material?.Manufacturer;
        }

        // Get Product Class
        public async Task<string?> GetProductClassAsync(string materialType)
        {
            var material = await GetMaterialByTypeAsync(materialType);
            return material?.ProductClass;
        }

        // Get All Conductivities
        public async Task<List<double?>> GetConductivitiesAsync(string materialType)
        {
            var material = await GetMaterialByTypeAsync(materialType);
            if (material == null) return new List<double?>();

            return new List<double?>
        {
            material.Conductivity1,
            material.Conductivity2,
            material.Conductivity3,
            material.Conductivity4,
            material.Conductivity5,
            material.Conductivity6,
            material.Conductivity7
        };
        }

        public async Task<List<MaterialDto>> GetAllMaterialsAsync()
        {
            return await _dbContext.Materials
                .Select(m => new MaterialDto
                {
                    Id = m.Id, // Add this line to include the ID
                    MaterialType = m.MaterialType,
                    Manufacturer = m.Manufacturer,
                    ProductClass = m.ProductClass,
                    MaxTemperatureLimit = m.MaxTemperatureLimit,
                    Density = m.Density,
                    SpecificHeat = m.SpecificHeat,
                    Conductivities = new List<double?>
                    {
                m.Conductivity1,
                m.Conductivity2,
                m.Conductivity3,
                m.Conductivity4,
                m.Conductivity5,
                m.Conductivity6,
                m.Conductivity7
                    }
                })
                .ToListAsync();
        }

        public async Task<Material> AddMaterialAsync(MaterialDto dto)
        {
            var material = new Material
            {
                MaterialType = dto.MaterialType,
                Manufacturer = dto.Manufacturer,
                ProductClass = dto.ProductClass,
                MaxTemperatureLimit = dto.MaxTemperatureLimit,
                Density = dto.Density,
                SpecificHeat = dto.SpecificHeat,
                Conductivity1 = dto.Conductivities.ElementAtOrDefault(0),
                Conductivity2 = dto.Conductivities.ElementAtOrDefault(1),
                Conductivity3 = dto.Conductivities.ElementAtOrDefault(2),
                Conductivity4 = dto.Conductivities.ElementAtOrDefault(3),
                Conductivity5 = dto.Conductivities.ElementAtOrDefault(4),
                Conductivity6 = dto.Conductivities.ElementAtOrDefault(5),
                Conductivity7 = dto.Conductivities.ElementAtOrDefault(6),
            };

            _dbContext.Materials.Add(material);
            await _dbContext.SaveChangesAsync();

            return material;
        }

        public async Task<MaterialDto?> GetMaterialByIdAsync(int id)
        {
            var material = await _dbContext.Materials.FindAsync(id);

            if (material == null) return null;

            return new MaterialDto
            {
                MaterialType = material.MaterialType,
                Manufacturer = material.Manufacturer,
                ProductClass = material.ProductClass,
                MaxTemperatureLimit = material.MaxTemperatureLimit,
                Density = material.Density,
                SpecificHeat = material.SpecificHeat,
                Conductivities = new List<double?>
        {
            material.Conductivity1,
            material.Conductivity2,
            material.Conductivity3,
            material.Conductivity4,
            material.Conductivity5,
            material.Conductivity6,
            material.Conductivity7
        }
            };
        }

        public async Task<bool> DeleteMaterialAsync(int id)
        {
            var material = await _dbContext.Materials.FindAsync(id);
            if (material == null)
                return false;

            _dbContext.Materials.Remove(material);
            await _dbContext.SaveChangesAsync();
            return true;
        }

        public async Task<bool> UpdateMaterialAsync(int id, MaterialDto dto)
        {
            // Find the existing material by its ID
            var material = await _dbContext.Materials.FindAsync(id);
            if (material == null)
            {
                // If material is not found, return false
                return false;
            }

            // Update the properties of the found material with the DTO data
            material.MaterialType = dto.MaterialType;
            material.Manufacturer = dto.Manufacturer;
            material.ProductClass = dto.ProductClass;
            material.MaxTemperatureLimit = dto.MaxTemperatureLimit;
            material.Density = dto.Density;
            material.SpecificHeat = dto.SpecificHeat;

            // Map the DTO's list of conductivities back to the model's properties
            material.Conductivity1 = dto.Conductivities.ElementAtOrDefault(0);
            material.Conductivity2 = dto.Conductivities.ElementAtOrDefault(1);
            material.Conductivity3 = dto.Conductivities.ElementAtOrDefault(2);
            material.Conductivity4 = dto.Conductivities.ElementAtOrDefault(3);
            material.Conductivity5 = dto.Conductivities.ElementAtOrDefault(4);
            material.Conductivity6 = dto.Conductivities.ElementAtOrDefault(5);
            material.Conductivity7 = dto.Conductivities.ElementAtOrDefault(6);

            // Save the changes to the database
            await _dbContext.SaveChangesAsync();

            // Return true to indicate a successful update
            return true;
        }


        public async Task<int> DeleteMaterialsAsync(List<int> ids)
        {
            if (ids == null || !ids.Any())
            {
                return 0; // No IDs provided, nothing to delete
            }

            // Find all materials with the given IDs
            var materialsToDelete = await _dbContext.Materials
                                                    .Where(m => ids.Contains(m.Id))
                                                    .ToListAsync();

            if (!materialsToDelete.Any())
            {
                return 0; // No matching materials found for the provided IDs
            }

            _dbContext.Materials.RemoveRange(materialsToDelete); // Remove all found materials
            await _dbContext.SaveChangesAsync(); // Save changes to the database

            return materialsToDelete.Count; // Return the count of successfully deleted materials
        }



        /// <summary>
        /// Clears all existing materials and uploads new materials from an Excel file stream.
        /// Assumes a predefined format:
        /// Column 1: MaterialType
        /// Column 2: Manufacturer
        /// Column 3: ProductClass
        /// Column 4: MaxTemperatureLimit
        /// Column 5: Density
        /// Column 6: SpecificHeat
        /// Columns 7-13: Conductivity1 to Conductivity7
        /// </summary>
        /// <param name="fileStream">The stream of the Excel file.</param>
        /// <returns>The number of materials successfully imported.</returns>
        public async Task<int> UploadMaterialsFromExcelAsync(Stream fileStream)
        {
            // Set the LicenseContext for EPPlus if you are using it (for non-commercial/development)
            // ExcelPackage.LicenseContext = LicenseContext.NonCommercial; // Or LicenseContext.Commercial if licensed

            // Clear existing materials first
            await _dbContext.Materials.ExecuteDeleteAsync(); // Efficiently deletes all rows
            // Or (less efficient for large tables):
            // _dbContext.Materials.RemoveRange(_dbContext.Materials);
            // await _dbContext.SaveChangesAsync();

            var importedMaterials = new List<Material>();
            int rowCount = 0;

            try
            {
                using (var package = new ExcelPackage(fileStream)) // For EPPlus
                // Or: using (var workbook = new XLWorkbook(fileStream)) // For ClosedXML
                {
                    var worksheet = package.Workbook.Worksheets.FirstOrDefault(); // For EPPlus, gets first worksheet
                    // Or: var worksheet = workbook.Worksheets.FirstOrDefault(); // For ClosedXML

                    if (worksheet == null)
                    {
                        throw new InvalidOperationException("Excel file contains no worksheets.");
                    }

                    // Assuming the first row is headers and data starts from the second row
                    // EPPlus: worksheet.Dimension.Start.Row is 1, worksheet.Dimension.End.Row is last data row
                    // ClosedXML: worksheet.FirstRowUsed(), worksheet.LastRowUsed()
                    for (int rowNum = 2; rowNum <= worksheet.Dimension.End.Row; rowNum++) // Loop through rows, skipping header
                    {
                        try
                        {
                            var material = new Material
                            {
                                // Adjust column indices based on your exact Excel format (1-based index)
                                MaterialType = worksheet.Cells[rowNum, 1].Text.Trim(),
                                Manufacturer = worksheet.Cells[rowNum, 2].Text.Trim(),
                                ProductClass = worksheet.Cells[rowNum, 3].Text.Trim(),
                                MaxTemperatureLimit = double.Parse(worksheet.Cells[rowNum, 4].Text),
                                Density = double.Parse(worksheet.Cells[rowNum, 5].Text),
                                SpecificHeat = double.Parse(worksheet.Cells[rowNum, 6].Text),
                                Conductivity1 = double.Parse(worksheet.Cells[rowNum, 7].Text),
                                Conductivity2 = double.Parse(worksheet.Cells[rowNum, 8].Text),
                                Conductivity3 = double.Parse(worksheet.Cells[rowNum, 9].Text),
                                Conductivity4 = double.Parse(worksheet.Cells[rowNum, 10].Text),
                                Conductivity5 = double.Parse(worksheet.Cells[rowNum, 11].Text),
                                Conductivity6 = double.Parse(worksheet.Cells[rowNum, 12].Text),
                                Conductivity7 = double.Parse(worksheet.Cells[rowNum, 13].Text)
                            };
                            importedMaterials.Add(material);
                            rowCount++;
                        }
                        catch (FormatException ex)
                        {
                            Console.WriteLine($"Skipping row {rowNum} due to format error: {ex.Message}");
                            // Log or handle rows with invalid data gracefully
                            continue;
                        }
                        catch (Exception ex)
                        {
                            Console.WriteLine($"An error occurred processing row {rowNum}: {ex.Message}");
                            continue;
                        }
                    }
                }

                _dbContext.Materials.AddRange(importedMaterials);
                await _dbContext.SaveChangesAsync();

                return rowCount;
            }
            catch (Exception ex)
            {
                Console.Error.WriteLine($"Error uploading materials from Excel: {ex.Message}");
                throw; // Re-throw the exception to be handled by the controller
            }
        }

    }
}