using System.ComponentModel.DataAnnotations;
using osuStats.OsuApi.Models;

namespace osuStats.Database.Models;

public class Score
{
    [Key]
    public required long Id { get; set; }

    public required int UserId { get; set; }

    public required int BeatmapId { get; set; }

    public required Grade Grade { get; set; }

    public required double Accuracy { get; set; }

    public required int Combo { get; set; }

    public required List<Mod> Mods { get; set; } = new();

    public required DateTime Date { get; set; }

    public required int TotalScore { get; set; }

    public required double? Pp { get; set; }

    public required Mode Mode { get; set; }

    public required bool HasReplay { get; set; }

    public required bool IsPerfectCombo { get; set; }
}
