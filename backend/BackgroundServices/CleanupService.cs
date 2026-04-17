
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

                var outdated = DateTime.UtcNow.AddMonths(-3);

                var deleted = await context.Scores.AsNoTracking()
                    .Where(x => x.Date < outdated)
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