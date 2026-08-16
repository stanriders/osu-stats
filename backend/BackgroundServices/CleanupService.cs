
using Microsoft.EntityFrameworkCore;
using osuStats.Database;

namespace osuStats.BackgroundServices;

public class CleanupService(IServiceScopeFactory serviceScopeFactory, ILogger<CleanupService> logger)
    : BackgroundService
{
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

                var today = DateOnly.FromDateTime(DateTime.UtcNow).AddDays(1); // TODO: this is today+1 to make it so we can migrate to partitions safely

                for (var i = 0; i <= 7; i++)
                {
                    var date = today.AddDays(i);
                    var nextDate = date.AddDays(1);

                    var partitionName = $"Scores_{date:yyyy_MM_dd}";

                    await context.Database.ExecuteSqlRawAsync($"""
                                                               CREATE TABLE IF NOT EXISTS "{partitionName}"
                                                               PARTITION OF "Scores"
                                                               FOR VALUES FROM ('{date:yyyy-MM-dd}')
                                                               TO ('{nextDate:yyyy-MM-dd}');
                                                               """, stoppingToken);
                }

                logger.LogInformation("Added score partitions from {Start} to {End}", today, today.AddDays(7));

                var outdated = today.AddMonths(-3);

                for (var i = -7; i <= 0; i++)
                {
                    var date = outdated.AddDays(i);
                    var partitionName = $"Scores_{date:yyyy_MM_dd}";

                    await context.Database.ExecuteSqlRawAsync($"DROP TABLE IF EXISTS \"{partitionName}\";", stoppingToken);
                }

                logger.LogInformation("Deleted score partitions older than {Date}", outdated);

                // TODO: remove this after complete transition to partitions
                var deleted = await context.Scores.AsNoTracking()
                    .Where(x => x.Date < outdated.ToDateTime(new TimeOnly(), DateTimeKind.Utc))
                    .ExecuteDeleteAsync(cancellationToken: stoppingToken);

                logger.LogInformation("Deleted {Count} scores older than {Date}", deleted, outdated);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "CleanupService failed! {Message}", ex.Message);
            }

            await Task.Delay((int)TimeSpan.FromDays(1).TotalMilliseconds, stoppingToken);
        }
    }
}