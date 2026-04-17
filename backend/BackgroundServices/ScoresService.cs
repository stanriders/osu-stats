using Microsoft.EntityFrameworkCore;
using osuStats.Database;
using osuStats.Database.Models;
using osuStats.OsuApi.Interfaces;
using System.Text.Json;
using Score = osuStats.Database.Models.Score;

namespace osuStats.BackgroundServices;

public class ScoresService(
    IOsuApiProvider osuApiProvider,
    IConfiguration configuration,
    ILogger<ScoresService> logger,
    IServiceScopeFactory serviceScopeFactory)
    : BackgroundService
{
    private readonly int _queryInterval = int.Parse(configuration["ScoreQueryInterval"]!);

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        var currentCursor = 0L;

        var cursorResponse = await osuApiProvider.GetScores(null);
        if (cursorResponse == null)
        {
            logger.LogWarning("Couldn't get current max score id!");
        }
        else
        {
            // catch up on the potentially missed scores while we were offline
            // 200k scores is ~an hour of scores which is getting processed in ~3.5 minutes
            currentCursor = cursorResponse.Scores.OrderByDescending(x => x.Id).First().Id - 200_000;
        }

        while (!stoppingToken.IsCancellationRequested)
        {
            var interval = _queryInterval;

            try
            {
                using var loopScope = serviceScopeFactory.CreateScope();
                await using var context = loopScope.ServiceProvider.GetService<DatabaseContext>();
                if (context == null)
                {
                    logger.LogError("Couldn't get a database instance!");
                    return;
                }

                var currentMaxScoreId = await context.Scores.AsNoTracking()
                    .Select(x => x.Id)
                    .OrderByDescending(x => x)
                    .FirstOrDefaultAsync(stoppingToken);

                if (currentCursor == 0)
                {
                    currentCursor = currentMaxScoreId;
                }

                if (currentCursor < currentMaxScoreId)
                {
                    // speed up the catching up process
                    interval = _queryInterval / 5;
                    logger.LogInformation("Catching up...");
                }

                var scoreResponse = await osuApiProvider.GetScores(currentCursor);
                if (scoreResponse == null)
                {
                    logger.LogError("Score query failed!");
                    await Task.Delay(interval, stoppingToken);
                    continue;
                }

                logger.LogInformation("Got a new score batch of {Count}, cursor {Cursor}", scoreResponse.Scores.Count,
                    currentCursor);

                if (scoreResponse.Scores.Count == 0)
                {
                    await Task.Delay(interval, stoppingToken);
                    continue;
                }

                static string ConvertJsonElement(JsonElement value)
                {
                    return value.ValueKind switch
                    {
                        JsonValueKind.String => value.GetString() ?? "",
                        JsonValueKind.True => "true",
                        JsonValueKind.False => "false",
                        JsonValueKind.Null => "",
                        _ => value.GetRawText()
                    };
                }

                foreach (var score in scoreResponse.Scores)
                {
                    if (!await context.Scores.AnyAsync(x => x.Id == score.Id, cancellationToken: stoppingToken))
                    {
                        context.Scores.Add(new Score
                        {
                            Id = score.Id,
                            UserId = score.UserId,
                            BeatmapId = score.BeatmapId,
                            Grade = score.Grade,
                            Accuracy = score.Accuracy,
                            Combo = score.Combo,
                            Mods = score.Mods.Select(x => new Mod
                            {
                                Acronym = x.Acronym,
                                Settings = x.Settings?.ToDictionary(s => s.Key, s => ConvertJsonElement(s.Value)) ??
                                           new Dictionary<string, string>()
                            }).ToList(),
                            Date = score.Date,
                            TotalScore = score.TotalScore,
                            Pp = score.Pp,
                            Mode = score.Mode,
                            HasReplay = score.HasReplay,
                            IsPerfectCombo = score.IsPerfectCombo
                        });
                    }
                }

                await context.SaveChangesAsync(stoppingToken);

                currentCursor = scoreResponse.Scores.OrderByDescending(x => x.Id).First().Id;
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "ScoresService failed! {Message}", ex.Message);
            }

            await Task.Delay(interval, stoppingToken);
        }
    }
}