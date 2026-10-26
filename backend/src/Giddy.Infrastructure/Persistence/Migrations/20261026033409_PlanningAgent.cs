using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Giddy.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class PlanningAgent : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Allergies",
                table: "Parties",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "[]");

            migrationBuilder.AddColumn<double>(
                name: "Area_Latitude",
                table: "Parties",
                type: "float",
                nullable: true);

            migrationBuilder.AddColumn<double>(
                name: "Area_Longitude",
                table: "Parties",
                type: "float",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Area_Name",
                table: "Parties",
                type: "nvarchar(80)",
                maxLength: 80,
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "Area_SearchRadiusKm",
                table: "Parties",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "BookingsToDo",
                table: "Parties",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "Budget",
                table: "Parties",
                type: "decimal(10,2)",
                precision: 10,
                scale: 2,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Checklist",
                table: "Parties",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ChildName",
                table: "Parties",
                type: "nvarchar(40)",
                maxLength: 40,
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "GuestCount",
                table: "Parties",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Theme",
                table: "Parties",
                type: "nvarchar(80)",
                maxLength: 80,
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "TurningAge",
                table: "Parties",
                type: "int",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "AgentTurns",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ConversationId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ParentMessageId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    StartedAt = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false),
                    Status = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    Events = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AgentTurns", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "CatalogueItems",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Category = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    Name = table.Column<string>(type: "nvarchar(120)", maxLength: 120, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Neighbourhood = table.Column<string>(type: "nvarchar(80)", maxLength: 80, nullable: false),
                    Latitude = table.Column<double>(type: "float", nullable: false),
                    Longitude = table.Column<double>(type: "float", nullable: false),
                    ServiceRadiusKm = table.Column<int>(type: "int", nullable: false),
                    Capacity = table.Column<int>(type: "int", nullable: true),
                    Price = table.Column<decimal>(type: "decimal(10,2)", precision: 10, scale: 2, nullable: false),
                    PriceBasis = table.Column<string>(type: "nvarchar(120)", maxLength: 120, nullable: false),
                    Features = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    AllergyFree = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Themes = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    UnavailableDates = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CatalogueItems", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Conversations",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ParentId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    PartyId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    StartedAt = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false),
                    Messages = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Conversations", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Memories",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    FamilyId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Text = table.Column<string>(type: "nvarchar(140)", maxLength: 140, nullable: false),
                    RememberedAt = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Memories", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Proposals",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ConversationId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    PartyId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Title = table.Column<string>(type: "nvarchar(120)", maxLength: 120, nullable: false),
                    ThemeName = table.Column<string>(type: "nvarchar(80)", maxLength: 80, nullable: false),
                    ThemeDetail = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Budget = table.Column<decimal>(type: "decimal(10,2)", precision: 10, scale: 2, nullable: true),
                    ProposedAt = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false),
                    AppliedAt = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: true),
                    Items = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Proposals", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "TurnLogs",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    TurnId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ConversationId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    PartyId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    Kind = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    Content = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    At = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TurnLogs", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_AgentTurns_ConversationId",
                table: "AgentTurns",
                column: "ConversationId");

            migrationBuilder.CreateIndex(
                name: "IX_CatalogueItems_Category",
                table: "CatalogueItems",
                column: "Category");

            migrationBuilder.CreateIndex(
                name: "IX_Conversations_ParentId_StartedAt",
                table: "Conversations",
                columns: new[] { "ParentId", "StartedAt" });

            migrationBuilder.CreateIndex(
                name: "IX_Memories_FamilyId",
                table: "Memories",
                column: "FamilyId");

            migrationBuilder.CreateIndex(
                name: "IX_Proposals_PartyId",
                table: "Proposals",
                column: "PartyId");

            migrationBuilder.CreateIndex(
                name: "IX_TurnLogs_At",
                table: "TurnLogs",
                column: "At");

            migrationBuilder.CreateIndex(
                name: "IX_TurnLogs_PartyId",
                table: "TurnLogs",
                column: "PartyId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "AgentTurns");

            migrationBuilder.DropTable(
                name: "CatalogueItems");

            migrationBuilder.DropTable(
                name: "Conversations");

            migrationBuilder.DropTable(
                name: "Memories");

            migrationBuilder.DropTable(
                name: "Proposals");

            migrationBuilder.DropTable(
                name: "TurnLogs");

            migrationBuilder.DropColumn(
                name: "Allergies",
                table: "Parties");

            migrationBuilder.DropColumn(
                name: "Area_Latitude",
                table: "Parties");

            migrationBuilder.DropColumn(
                name: "Area_Longitude",
                table: "Parties");

            migrationBuilder.DropColumn(
                name: "Area_Name",
                table: "Parties");

            migrationBuilder.DropColumn(
                name: "Area_SearchRadiusKm",
                table: "Parties");

            migrationBuilder.DropColumn(
                name: "BookingsToDo",
                table: "Parties");

            migrationBuilder.DropColumn(
                name: "Budget",
                table: "Parties");

            migrationBuilder.DropColumn(
                name: "Checklist",
                table: "Parties");

            migrationBuilder.DropColumn(
                name: "ChildName",
                table: "Parties");

            migrationBuilder.DropColumn(
                name: "GuestCount",
                table: "Parties");

            migrationBuilder.DropColumn(
                name: "Theme",
                table: "Parties");

            migrationBuilder.DropColumn(
                name: "TurningAge",
                table: "Parties");
        }
    }
}
