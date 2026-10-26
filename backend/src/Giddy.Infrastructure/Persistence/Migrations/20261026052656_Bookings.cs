using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Giddy.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class Bookings : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Bookings",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    PartyId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    VenueId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    VenueName = table.Column<string>(type: "nvarchar(120)", maxLength: 120, nullable: false),
                    Date = table.Column<DateOnly>(type: "date", nullable: false),
                    Start = table.Column<TimeOnly>(type: "time", nullable: false),
                    End = table.Column<TimeOnly>(type: "time", nullable: false),
                    Room = table.Column<string>(type: "nvarchar(80)", maxLength: 80, nullable: false),
                    Capacity = table.Column<int>(type: "int", nullable: false),
                    Price = table.Column<decimal>(type: "decimal(10,2)", precision: 10, scale: 2, nullable: false),
                    Deposit = table.Column<decimal>(type: "decimal(10,2)", precision: 10, scale: 2, nullable: false),
                    State = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    HoldReference = table.Column<string>(type: "nvarchar(120)", maxLength: 120, nullable: false),
                    HoldExpiresAt = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false),
                    PaymentId = table.Column<string>(type: "nvarchar(120)", maxLength: 120, nullable: true),
                    CardBrand = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true),
                    CardLast4 = table.Column<string>(type: "nvarchar(4)", maxLength: 4, nullable: true),
                    ChallengeUrl = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    ConfirmationNumber = table.Column<string>(type: "nvarchar(40)", maxLength: 40, nullable: true),
                    BookedBy = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    BookingName = table.Column<string>(type: "nvarchar(80)", maxLength: 80, nullable: false),
                    Mobile = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    Child = table.Column<string>(type: "nvarchar(80)", maxLength: 80, nullable: false),
                    Notes = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    FreeCancellationUntil = table.Column<DateOnly>(type: "date", nullable: false),
                    CreatedAt = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false),
                    ConfirmedAt = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: true),
                    CancelledAt = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: true),
                    Refunded = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Bookings", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "DisruptionNotices",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Title = table.Column<string>(type: "nvarchar(160)", maxLength: 160, nullable: false),
                    Detail = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    Latitude = table.Column<double>(type: "float", nullable: false),
                    Longitude = table.Column<double>(type: "float", nullable: false),
                    RadiusKm = table.Column<double>(type: "float", nullable: false),
                    From = table.Column<DateOnly>(type: "date", nullable: false),
                    To = table.Column<DateOnly>(type: "date", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DisruptionNotices", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "SavedCards",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ParentId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ProviderToken = table.Column<string>(type: "nvarchar(120)", maxLength: 120, nullable: false),
                    Brand = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    Last4 = table.Column<string>(type: "nvarchar(4)", maxLength: 4, nullable: false),
                    CreatedAt = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SavedCards", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Bookings_PartyId",
                table: "Bookings",
                column: "PartyId");

            migrationBuilder.CreateIndex(
                name: "IX_DisruptionNotices_To",
                table: "DisruptionNotices",
                column: "To");

            migrationBuilder.CreateIndex(
                name: "IX_SavedCards_ParentId",
                table: "SavedCards",
                column: "ParentId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Bookings");

            migrationBuilder.DropTable(
                name: "DisruptionNotices");

            migrationBuilder.DropTable(
                name: "SavedCards");
        }
    }
}
