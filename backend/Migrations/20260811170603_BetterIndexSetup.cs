using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace osuStats.Migrations
{
    /// <inheritdoc />
    public partial class BetterIndexSetup : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Scores_Date",
                table: "Scores");

            migrationBuilder.DropIndex(
                name: "IX_Scores_HasReplay",
                table: "Scores");

            migrationBuilder.DropIndex(
                name: "IX_Scores_IsPerfectCombo",
                table: "Scores");

            migrationBuilder.CreateIndex(
                name: "IX_Scores_Date",
                table: "Scores",
                column: "Date")
                .Annotation("Npgsql:IndexMethod", "brin");

            migrationBuilder.CreateIndex(
                name: "IX_Scores_Mods",
                table: "Scores",
                column: "Mods")
                .Annotation("Npgsql:IndexMethod", "gin");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Scores_Date",
                table: "Scores");

            migrationBuilder.DropIndex(
                name: "IX_Scores_Mods",
                table: "Scores");

            migrationBuilder.CreateIndex(
                name: "IX_Scores_Date",
                table: "Scores",
                column: "Date");

            migrationBuilder.CreateIndex(
                name: "IX_Scores_HasReplay",
                table: "Scores",
                column: "HasReplay");

            migrationBuilder.CreateIndex(
                name: "IX_Scores_IsPerfectCombo",
                table: "Scores",
                column: "IsPerfectCombo");
        }
    }
}
