using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace fx_backend.Migrations
{
    /// <inheritdoc />
    public partial class CreateMaterialsTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Materials",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    MaterialType = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    SpecificHeat = table.Column<double>(type: "float", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Materials", x => x.Id);
                });

            migrationBuilder.InsertData(
                table: "Materials",
                columns: new[] { "Id", "MaterialType", "SpecificHeat" },
                values: new object[,]
                {
                    { 1, "Water", 4.1840000000000002 },
                    { 2, "Wood", 1.76 },
                    { 3, "Glass", 0.83999999999999997 },
                    { 4, "Silica", 0.82999999999999996 }
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Materials");
        }
    }
}
