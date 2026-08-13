using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;
using osuStats.Database;
using osuStats.OsuApi.Models;
using System.Globalization;
using Score = osuStats.Database.Models.Score;

namespace osuStats.Controllers;

[ApiController]
[Route("[controller]")]
//[EnableRateLimiting("token")]
public class ApiController(DatabaseContext databaseContext, IMemoryCache cache)
    : ControllerBase
{
    [HttpGet("hourly")]
    public async Task<IActionResult> GetHourly([FromQuery] int? rulesetId, [FromQuery] string[]? modsInclude, [FromQuery] string[]? modsExclude, [FromQuery] bool? hasSettings, 
        [FromQuery] DateTime? hourlyDate)
    {
        var query = databaseContext.Scores.AsNoTracking();

        hourlyDate ??= DateTime.UtcNow.AddHours(-1);
        hourlyDate = new DateTime(hourlyDate.Value.Year, hourlyDate.Value.Month, hourlyDate.Value.Day, hourlyDate.Value.Hour, 0, 0, hourlyDate.Value.Kind);

        var key = $"unfiltered_hourly_{hourlyDate.Value.ToString(CultureInfo.InvariantCulture)}";
        if (!cache.TryGetValue(key, out var unfiltered))
        {
            unfiltered = await GetHourlyStats(query, hourlyDate.Value);
            cache.Set(key, unfiltered, TimeSpan.FromMinutes(1));
        }

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
            Filtered = anyFiltersEnabled ? await GetHourlyStats(query, hourlyDate.Value) : null
        });
    }

    [HttpGet]
    public async Task<IActionResult> Get([FromQuery] int? rulesetId, [FromQuery] string[]? modsInclude, [FromQuery] string[]? modsExclude, [FromQuery] bool? hasSettings)
    {
        var query = databaseContext.Scores.AsNoTracking();

        var date = DateTime.UtcNow;
        date = new DateTime(date.Year, date.Month, date.Day, date.Hour, 0, 0, date.Kind);

        var key = $"unfiltered_daily_{date.ToString(CultureInfo.InvariantCulture)}";
        if (!cache.TryGetValue(key, out var unfiltered))
        {
            unfiltered = await GetStats(query);
            cache.Set(key, unfiltered, TimeSpan.FromMinutes(10));
        }

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
            Filtered = anyFiltersEnabled ? await GetStats(query) : null
        });
    }

    private async Task<List<HourlyCount>> GetHourlyStats(IQueryable<Score> query, DateTime hourlyDate)
    {
        return await query
            .Where(x => x.Date >= hourlyDate.AddDays(-1))
            .Where(x => x.Date <= hourlyDate)
            .GroupBy(s => new { s.Date.Date, s.Date.Hour })
            .OrderBy(x => x.Key.Date)
            .ThenBy(x => x.Key.Hour)
            .Select(g => new HourlyCount(g.Key.Hour, g.Count()))
            .ToListAsync();
    }

    private async Task<Stats> GetStats(IQueryable<Score> query)
    {
        var countByDay = await query
            .GroupBy(s => s.Date.Date)
            .OrderBy(x => x.Key)
            .Select(g => new DailyCount(g.Key, g.Count()))
            .ToListAsync();

        var countByMonth = countByDay
            .GroupBy(x => new { x.Date.Year, x.Date.Month })
            .OrderBy(x => x.Key.Year)
            .ThenBy(x => x.Key.Month)
            .Select(g => new MonthlyCount(new DateTime(g.Key.Year, g.Key.Month, 1), g.Sum(x => x.Count)))
            .ToList();

        var aggregate = await query
            .GroupBy(_ => 1) // this forces efcore to do the whole aggregate as one query
            .Select(g => new
            {
                TotalCount = g.Count(),
                TotalPerfectCombo = g.Count(x => x.IsPerfectCombo),
                TotalHasReplay = g.Count(x => x.HasReplay),
                TotalSS = g.Count(x => x.Grade == Grade.X || x.Grade == Grade.XH),
                TotalS = g.Count(x => x.Grade == Grade.S || x.Grade == Grade.SH),
                TotalA = g.Count(x => x.Grade == Grade.A),
                AverageAccuracy = g.Average(x => x.Accuracy),
                AverageCombo = g.Average(x => x.Combo),
                AveragePp = g.Where(x => x.Pp != null).Select(x => x.Pp).Average()
            })
            .SingleOrDefaultAsync();

        return new Stats(aggregate?.TotalCount ?? 0, 
            aggregate?.TotalPerfectCombo ?? 0,
            aggregate?.TotalHasReplay ?? 0,
            aggregate?.TotalSS ?? 0,
            aggregate?.TotalS ?? 0,
            aggregate?.TotalA ?? 0,
            aggregate?.AverageAccuracy ?? 0,
            aggregate?.AverageCombo ?? 0,
            aggregate?.AveragePp, 
            countByMonth, 
            countByDay);
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
        List<DailyCount> CountByDay);

    private record MonthlyCount(DateTime Date, int Count);
    private record DailyCount(DateTime Date, int Count);
    private record HourlyCount(int Hour, int Count);
}
