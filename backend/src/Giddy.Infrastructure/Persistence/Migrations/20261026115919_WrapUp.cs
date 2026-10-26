using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Giddy.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class WrapUp : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "PartyTemplates",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    SourcePartyId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    OwnerId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(120)", maxLength: 120, nullable: false),
                    ChildId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    ChildName = table.Column<string>(type: "nvarchar(60)", maxLength: 60, nullable: true),
                    Theme = table.Column<string>(type: "nvarchar(80)", maxLength: 80, nullable: true),
                    RemindOn = table.Column<DateOnly>(type: "date", nullable: true),
                    RemindedAt = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: true),
                    CreatedAt = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false),
                    Bookings = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Tasks = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PartyTemplates", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "ProviderRatings",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    PartyId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ProviderId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    RatedBy = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Stars = table.Column<int>(type: "int", nullable: false),
                    Review = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    RatedAt = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ProviderRatings", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "ThankYouNotes",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    PartyId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    GuestId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Gift = table.Column<string>(type: "nvarchar(120)", maxLength: 120, nullable: true),
                    Message = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    SentAt = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ThankYouNotes", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_PartyTemplates_OwnerId",
                table: "PartyTemplates",
                column: "OwnerId");

            migrationBuilder.CreateIndex(
                name: "IX_PartyTemplates_SourcePartyId",
                table: "PartyTemplates",
                column: "SourcePartyId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ProviderRatings_PartyId_ProviderId",
                table: "ProviderRatings",
                columns: new[] { "PartyId", "ProviderId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ThankYouNotes_PartyId_GuestId",
                table: "ThankYouNotes",
                columns: new[] { "PartyId", "GuestId" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "PartyTemplates");

            migrationBuilder.DropTable(
                name: "ProviderRatings");

            migrationBuilder.DropTable(
                name: "ThankYouNotes");
        }
    }
}
