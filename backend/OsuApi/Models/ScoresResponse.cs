using System.Text.Json.Serialization;

namespace osuStats.OsuApi.Models;

public class ScoresResponse
{
    [JsonPropertyName("scores")]
    public List<Score> Scores { get; set; } = null!;

    [JsonPropertyName("cursor_string")]
    public string CursorString { get; set; } = null!;
}
