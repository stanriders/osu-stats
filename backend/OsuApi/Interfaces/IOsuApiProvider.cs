using osuStats.OsuApi.Models;

namespace osuStats.OsuApi.Interfaces;

public interface IOsuApiProvider
{
    Task<ScoresResponse?> GetScores(long? cursor);
}
