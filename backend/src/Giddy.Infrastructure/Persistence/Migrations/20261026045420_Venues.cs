using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Giddy.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class Venues : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "Area_InServiceArea",
                table: "Parties",
                type: "bit",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Venue",
                table: "CatalogueItems",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "FavouriteVenues",
                columns: table => new
                {
                    FamilyId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    VenueId = table.Column<Guid>(type: "uniqueidentifier", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_FavouriteVenues", x => new { x.FamilyId, x.VenueId });
                });

            migrationBuilder.CreateTable(
                name: "VenueWaitlist",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    FamilyId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    VenueId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Date = table.Column<DateOnly>(type: "date", nullable: false),
                    PartyId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    RequestedAt = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_VenueWaitlist", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_VenueWaitlist_VenueId_Date",
                table: "VenueWaitlist",
                columns: new[] { "VenueId", "Date" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "FavouriteVenues");

            migrationBuilder.DropTable(
                name: "VenueWaitlist");

            migrationBuilder.DropColumn(
                name: "Area_InServiceArea",
                table: "Parties");

            migrationBuilder.DropColumn(
                name: "Venue",
                table: "CatalogueItems");
        }
    }
}
