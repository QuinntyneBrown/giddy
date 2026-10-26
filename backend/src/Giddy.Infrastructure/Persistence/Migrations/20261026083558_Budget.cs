using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Giddy.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class Budget : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Expenses",
                table: "Parties",
                type: "nvarchar(max)",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Expenses",
                table: "Parties");
        }
    }
}
