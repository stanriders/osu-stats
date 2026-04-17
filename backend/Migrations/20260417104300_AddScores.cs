using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace osuStats.Migrations
{
    /// <inheritdoc />
    public partial class AddScores : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterDatabase()
                .Annotation("Npgsql:PostgresExtension:hstore", ",,");

            migrationBuilder.CreateTable(
                name: "Scores",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    UserId = table.Column<int>(type: "integer", nullable: false),
                    BeatmapId = table.Column<int>(type: "integer", nullable: false),
                    Grade = table.Column<int>(type: "integer", nullable: false),
                    Accuracy = table.Column<double>(type: "double precision", nullable: false),
                    Combo = table.Column<int>(type: "integer", nullable: false),
                    Date = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    TotalScore = table.Column<int>(type: "integer", nullable: false),
                    Pp = table.Column<double>(type: "double precision", nullable: true),
                    Mode = table.Column<int>(type: "integer", nullable: false),
                    HasReplay = table.Column<bool>(type: "boolean", nullable: false),
                    IsPerfectCombo = table.Column<bool>(type: "boolean", nullable: false),
                    Mods = table.Column<string>(type: "jsonb", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Scores", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Scores_Mode",
                table: "Scores",
                column: "Mode");

            migrationBuilder.CreateIndex(
                name: "IX_Scores_Pp",
                table: "Scores",
                column: "Pp");

            migrationBuilder.Sql("CREATE INDEX idx_mods ON \"Scores\" USING GIN (\"Mods\");");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Scores");
        }
    }
}
