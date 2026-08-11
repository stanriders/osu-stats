using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace osuStats.Migrations
{
    /// <inheritdoc />
    public partial class AddMoreIndices : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateIndex(
                name: "IX_Scores_Grade",
                table: "Scores",
                column: "Grade");

            migrationBuilder.CreateIndex(
                name: "IX_Scores_HasReplay",
                table: "Scores",
                column: "HasReplay");

            migrationBuilder.CreateIndex(
                name: "IX_Scores_IsPerfectCombo",
                table: "Scores",
                column: "IsPerfectCombo");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Scores_Grade",
                table: "Scores");

            migrationBuilder.DropIndex(
                name: "IX_Scores_HasReplay",
                table: "Scores");

            migrationBuilder.DropIndex(
                name: "IX_Scores_IsPerfectCombo",
                table: "Scores");
        }
    }
}
