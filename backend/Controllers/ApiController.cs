using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;
using osuStats.Database;
using osuStats.OsuApi.Models;
using Score = osuStats.Database.Models.Score;

namespace osuStats.Controllers;

[ApiController]
[Route("[controller]")]
//[EnableRateLimiting("token")]
public class ApiController(DatabaseContext databaseContext)
    : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> Get([FromQuery] int? rulesetId, [FromQuery] string[]? modsInclude, [FromQuery] string[]? modsExclude, [FromQuery] bool? hasSettings, [FromQuery] DateTime? hourlyDate)
    {
        var query = databaseContext.Scores.OrderBy(x => x.Date).AsNoTracking();

        hourlyDate ??= DateTime.UtcNow.AddHours(-1);
        var unfiltered = await GetStats(query, hourlyDate.Value);

        bool anyFiltersEnabled = rulesetId != null || modsInclude is { Length: > 0 } || modsExclude is { Length: > 0 } || hasSettings != null;

        if (rulesetId != null)
        {
            query = query.Where(x => (int)x.Mode == rulesetId.Value);
        }

        if (modsInclude != null && modsInclude.Length > 0)
        {
            query = query.Where(s => EF.Functions.JsonContains(
                s.Mods,
                @$"[{string.Join(',', modsInclude.Select(x => $"{{ \"Acronym\": \"{x}\" }}"))}]"
            ));
        }

        if (modsExclude != null && modsExclude.Length > 0)
        {
            query = query.Where(s => !EF.Functions.JsonContains(
                s.Mods,
                @$"[{string.Join(',', modsExclude.Select(x => $"{{ \"Acronym\": \"{x}\" }}"))}]"
            ));
        }

        /*
        if (hasSettings != null)
        {
            query = query
                .Where(s => s.Mods.Any(m => m.Settings.Count > 0));
        }*/

        return Ok(new
        {
            Unfiltered = unfiltered,
            Filtered = anyFiltersEnabled ? await GetStats(query, hourlyDate.Value) : null
        });
    }

    private async Task<Stats> GetStats(IQueryable<Score> query, DateTime hourlyDate)
    {
        var countByMonth = await query
            .GroupBy(s => new { s.Date.Year, s.Date.Month })
            .Select(g => new MonthlyCount(new DateTime(g.Key.Year, g.Key.Month, 1), g.Count()))
            .ToListAsync();

        var countByDay = await query
            .GroupBy(s => s.Date.Date)
            .Select(g => new DailyCount(g.Key, g.Count()))
            .ToListAsync();

        var countByHour = await query
            .Where(x => x.Date >= hourlyDate.AddDays(-1))
            .Where(x => x.Date <= hourlyDate)
            .GroupBy(s => new { s.Date.Date, s.Date.Hour })
            .OrderBy(x => x.Key.Date)
            .ThenBy(x => x.Key.Hour)
            .Select(g => new HourlyCount(g.Key.Hour, g.Count()))
            .ToListAsync();

        var totalCount = await query.CountAsync();
        var totalPerfectCombo = await query.Where(x => x.IsPerfectCombo).CountAsync();
        var totalHasReplay = await query.Where(x => x.HasReplay).CountAsync();
        var totalSS = await query.Where(x => x.Grade == Grade.X || x.Grade == Grade.XH).CountAsync();
        var totalS = await query.Where(x => x.Grade == Grade.S || x.Grade == Grade.SH).CountAsync();
        var totalA = await query.Where(x => x.Grade == Grade.A).CountAsync();
        var averageAccuracy = await query.AverageAsync(x => x.Accuracy);
        var averageCombo = await query.AverageAsync(x => x.Combo);
        var averagePp = await query.Where(x => x.Pp != null).AverageAsync(x => x.Pp);

        return new Stats(totalCount, totalPerfectCombo, totalHasReplay, totalSS, totalS, totalA, averageAccuracy,
            averageCombo, averagePp, countByMonth, countByDay, countByHour);
    }

    private record Stats(
        int TotalCount,
        int TotalPerfectCombo,
        int TotalHasReplay,
        int TotalSS,
        int TotalS,
        int TotalA,
        double AverageAccuracy,
        double AverageCombo,
        double? AveragePp,
        List<MonthlyCount> CountByMonth,
        List<DailyCount> CountByDay,
        List<HourlyCount> CountByHour);

    private record MonthlyCount(DateTime Date, int Count);
    private record DailyCount(DateTime Date, int Count);
    private record HourlyCount(int Hour, int Count);
}
