using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Giddy.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class Invitations : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTimeOffset>(
                name: "AllergyListSharedAt",
                table: "Parties",
                type: "datetimeoffset",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "AllergyUpdateFor",
                table: "Parties",
                type: "nvarchar(40)",
                maxLength: 40,
                nullable: true);

            migrationBuilder.CreateTable(
                name: "Guests",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    PartyId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ChildName = table.Column<string>(type: "nvarchar(80)", maxLength: 80, nullable: false),
                    ParentName = table.Column<string>(type: "nvarchar(80)", maxLength: 80, nullable: false),
                    Email = table.Column<string>(type: "nvarchar(254)", maxLength: 254, nullable: true),
                    Mobile = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true),
                    Rsvp = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    Allergies = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    ParentStaying = table.Column<bool>(type: "bit", nullable: true),
                    Siblings = table.Column<int>(type: "int", nullable: true),
                    Note = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    TokenHash = table.Column<string>(type: "nvarchar(64)", maxLength: 64, nullable: true),
                    ProtectedToken = table.Column<string>(type: "nvarchar(400)", maxLength: 400, nullable: true),
                    InvitedAt = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: true),
                    OpenedAt = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: true),
                    RepliedAt = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: true),
                    LastRemindedAt = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: true),
                    EmailBounced = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Guests", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Invitations",
                columns: table => new
                {
                    PartyId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Design = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    Headline = table.Column<string>(type: "nvarchar(60)", maxLength: 60, nullable: false),
                    Message = table.Column<string>(type: "nvarchar(280)", maxLength: 280, nullable: false),
                    RsvpBy = table.Column<DateOnly>(type: "date", nullable: false),
                    AskAllergies = table.Column<bool>(type: "bit", nullable: false),
                    AskParentStaying = table.Column<bool>(type: "bit", nullable: false),
                    AskSiblings = table.Column<bool>(type: "bit", nullable: false),
                    ByEmail = table.Column<bool>(type: "bit", nullable: false),
                    ByText = table.Column<bool>(type: "bit", nullable: false),
                    SentAt = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Invitations", x => x.PartyId);
                });

            migrationBuilder.CreateTable(
                name: "PartyEvents",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    PartyId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    GuestId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    Kind = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    Tone = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    Title = table.Column<string>(type: "nvarchar(160)", maxLength: 160, nullable: false),
                    Text = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    ActionLabel = table.Column<string>(type: "nvarchar(80)", maxLength: 80, nullable: true),
                    ActionKind = table.Column<string>(type: "nvarchar(40)", maxLength: 40, nullable: true),
                    CreatedAt = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PartyEvents", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Guests_PartyId",
                table: "Guests",
                column: "PartyId");

            migrationBuilder.CreateIndex(
                name: "IX_Guests_TokenHash",
                table: "Guests",
                column: "TokenHash",
                unique: true,
                filter: "[TokenHash] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_PartyEvents_PartyId_Id",
                table: "PartyEvents",
                columns: new[] { "PartyId", "Id" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Guests");

            migrationBuilder.DropTable(
                name: "Invitations");

            migrationBuilder.DropTable(
                name: "PartyEvents");

            migrationBuilder.DropColumn(
                name: "AllergyListSharedAt",
                table: "Parties");

            migrationBuilder.DropColumn(
                name: "AllergyUpdateFor",
                table: "Parties");
        }
    }
}
