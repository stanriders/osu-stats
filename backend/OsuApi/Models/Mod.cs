using System.Text.Json;
using System.Text.Json.Serialization;

namespace osuStats.OsuApi.Models;

public class Mod
{
    [JsonPropertyName("acronym")]
    public required string Acronym { get; set; }

    [JsonPropertyName("settings")]
    public Dictionary<string, JsonElement>? Settings { get; set; }
}
