using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace osuStats.Migrations
{
    /// <inheritdoc />
    public partial class AddDateIndex : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateIndex(
                name: "IX_Scores_Date",
                table: "Scores",
                column: "Date");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Scores_Date",
                table: "Scores");
        }
    }
}
