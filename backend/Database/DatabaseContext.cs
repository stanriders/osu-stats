using Microsoft.EntityFrameworkCore;
using osuStats.Database.Models;

namespace osuStats.Database;

public class DatabaseContext : DbContext
{
    public DatabaseContext(DbContextOptions<DatabaseContext> options) : base(options) { }

    private DatabaseContext() { }
    public DbSet<Score> Scores { get; set; } = null!;

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Score>().HasIndex(x => x.Pp);
        modelBuilder.Entity<Score>().HasIndex(x => x.Mode);
        modelBuilder.Entity<Score>().HasIndex(x => x.Date);

        modelBuilder.Entity<Score>()
            .Property(x => x.Mods)
            .HasColumnType("jsonb")
            .HasConversion(
                v => System.Text.Json.JsonSerializer.Serialize(v, (System.Text.Json.JsonSerializerOptions?)null),
                v => System.Text.Json.JsonSerializer.Deserialize<List<Mod>>(v, (System.Text.Json.JsonSerializerOptions?)null)!
            );

        base.OnModelCreating(modelBuilder);
    }
}
