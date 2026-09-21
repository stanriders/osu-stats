using Microsoft.EntityFrameworkCore;
using Npgsql;
using osuStats.Database;
using osuStats.Database.Models;

namespace osuStats.BackgroundServices;

public class DailyAggregateFoldService(IServiceScopeFactory serviceScopeFactory, ILogger<DailyAggregateFoldService> logger)
    : BackgroundService
{
    private const int LookbackDays = 90;

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {

            try
            {
                using var loopScope = serviceScopeFactory.CreateScope();
                var context = loopScope.ServiceProvider.GetService<DatabaseContext>();
                if (context == null)
                {
                    logger.LogError("Couldn't get a database instance!");
                    return;
                }

                var today = DateOnly.FromDateTime(DateTime.UtcNow);

                var existing = await context.DailyAggregates
                    .Where(x => x.Date >= today.AddDays(-LookbackDays) && x.Date < today)
                    .Select(x => x.Date)
                    .ToHashSetAsync(stoppingToken);

                var missingDays = Enumerable.Range(1, LookbackDays)
                    .Select(offset => today.AddDays(-offset))
                    .Where(day => !existing.Contains(day))
                    .ToList();

                if (missingDays.Count == 0)
                {
                    await Task.Delay((int)TimeSpan.FromHours(1).TotalMilliseconds, stoppingToken);
                    continue;
                }

                logger.LogInformation("Folding {Count} missing day(s): {Days}", missingDays.Count,
                    string.Join(", ", missingDays));

                foreach (var day in missingDays)
                {
                    stoppingToken.ThrowIfCancellationRequested();

                    var start = DateTime.SpecifyKind(day.ToDateTime(TimeOnly.MinValue), DateTimeKind.Utc);
                    var end = DateTime.SpecifyKind(day.AddDays(1).ToDateTime(TimeOnly.MinValue), DateTimeKind.Utc);

                    var count = await context.Scores.AsNoTracking()
                        .Where(s => s.Date >= start && s.Date < end)
                        .LongCountAsync(stoppingToken);

                    context.DailyAggregates.Add(new DailyAggregate
                    {
                        Date = day,
                        Count = count
                    });

                    try
                    {
                        await context.SaveChangesAsync(stoppingToken);
                    }
                    catch (DbUpdateException ex) when (ex.InnerException is PostgresException
                                                       {
                                                           SqlState: PostgresErrorCodes.UniqueViolation
                                                       })
                    {
                        logger.LogInformation("{Day} was already inserted, skipping", day);
                    }
                }

            }
            catch (Exception ex)
            {
                logger.LogError(ex, "DailyAggregateFoldService failed! {Message}", ex.Message);
            }
            finally
            {
                await Task.Delay((int)TimeSpan.FromHours(6).TotalMilliseconds, stoppingToken);
            }
        }
    }
}