using System.Collections.Generic;
using Microsoft.EntityFrameworkCore.Migrations;
using osuStats.Database.Models;

#nullable disable

namespace osuStats.Migrations
{
    /// <inheritdoc />
    public partial class FixModsInsert : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterDatabase()
                .OldAnnotation("Npgsql:PostgresExtension:hstore", ",,");

            migrationBuilder.AlterColumn<List<Mod>>(
                name: "Mods",
                table: "Scores",
                type: "jsonb",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "jsonb",
                oldNullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterDatabase()
                .Annotation("Npgsql:PostgresExtension:hstore", ",,");

            migrationBuilder.AlterColumn<string>(
                name: "Mods",
                table: "Scores",
                type: "jsonb",
                nullable: true,
                oldClrType: typeof(List<Mod>),
                oldType: "jsonb");
        }
    }
}
