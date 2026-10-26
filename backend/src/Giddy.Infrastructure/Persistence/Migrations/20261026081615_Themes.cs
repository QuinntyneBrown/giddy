using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Giddy.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class Themes : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "ThemeInfo",
                table: "CatalogueItems",
                type: "nvarchar(max)",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ThemeInfo",
                table: "CatalogueItems");
        }
    }
}
