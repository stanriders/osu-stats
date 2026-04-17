using System.Text.Json.Serialization;

namespace osuStats.OsuApi.Models;

public class Score
{
    [JsonPropertyName("id")]
    public long Id { get; set; }

    [JsonPropertyName("user_id")]
    public int UserId { get; set; }

    [JsonPropertyName("beatmap_id")]
    public int BeatmapId { get; set; }

    [JsonPropertyName("rank")]
    [JsonConverter(typeof(JsonStringEnumConverter))]
    public Grade Grade { get; set; }

    [JsonPropertyName("accuracy")]
    public double Accuracy { get; set; }

    [JsonPropertyName("max_combo")]
    public int Combo { get; set; }

    [JsonPropertyName("mods")]
    public Mod[] Mods { get; set; } = Array.Empty<Mod>();

    [JsonPropertyName("ended_at")]
    public DateTime Date { get; set; }

    [JsonPropertyName("total_score")]
    public int TotalScore { get; set; }

    [JsonPropertyName("ruleset_id")]
    public Mode Mode { get; set; }

    [JsonPropertyName("pp")]
    public double? Pp { get; set; }

    [JsonPropertyName("has_replay")]
    public bool HasReplay { get; set; }

    [JsonPropertyName("is_perfect_combo")]
    public bool IsPerfectCombo { get; set; }
}
