
namespace osuStats.Database.Models;

public record Mod
{
    public required string Acronym { get; set; }
    public Dictionary<string, string> Settings { get; set; } = new();
}