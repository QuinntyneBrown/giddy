using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Giddy.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class RunSheet : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "RunSheet",
                table: "Parties",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ContactName",
                table: "CatalogueItems",
                type: "nvarchar(60)",
                maxLength: 60,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Phone",
                table: "CatalogueItems",
                type: "nvarchar(20)",
                maxLength: 20,
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "RunSheet",
                table: "Parties");

            migrationBuilder.DropColumn(
                name: "ContactName",
                table: "CatalogueItems");

            migrationBuilder.DropColumn(
                name: "Phone",
                table: "CatalogueItems");
        }
    }
}
