using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;
using osuStats.Database;
using osuStats.OsuApi.Models;

namespace osuStats.Controllers;

[ApiController]
[Route("[controller]")]
//[EnableRateLimiting("token")]
public class ApiController(DatabaseContext databaseContext)
    : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> Get([FromQuery] int? rulesetId, [FromQuery] string[]? modsInclude, [FromQuery] string[]? modsExclude, [FromQuery] bool? hasSettings)
    {
        var query = databaseContext.Scores.OrderBy(x => x.Date).AsNoTracking();

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

        var count = await query
            .GroupBy(s => s.Date.Date)
            .Select(g => new
            {
                Date = g.Key,
                Count = g.Count()
            })
            .ToListAsync();

        var countByMonth = await query
            .GroupBy(s => new { s.Date.Year, s.Date.Month })
            .Select(g => new
            {
                Date = new DateTime(g.Key.Year, g.Key.Month, 1),
                Count = g.Count()
            })
            .ToListAsync();

        var countByHour = await query
            .Where(x=> x.Date > DateTime.UtcNow.AddDays(-1))
            .GroupBy(s => s.Date.Hour)
            .Select(g => new
            {
                Hour = g.Key,
                Count = g.Count()
            })
            .ToListAsync();

        var totalCount = await query.CountAsync();
        var totalPerfectCombo = await query.Where(x=> x.IsPerfectCombo).CountAsync();
        var totalHasReplay = await query.Where(x => x.HasReplay).CountAsync();
        var totalSS = await query.Where(x => x.Grade == Grade.X || x.Grade == Grade.XH).CountAsync();
        var totalS = await query.Where(x => x.Grade == Grade.S || x.Grade == Grade.SH).CountAsync();
        var totalA = await query.Where(x => x.Grade == Grade.A).CountAsync();
        var averageAccuracy = await query.AverageAsync(x => x.Accuracy);
        var averageCombo = await query.AverageAsync(x => x.Combo);
        var averagePp = await query.Where(x=> x.Pp != null).AverageAsync(x => x.Pp);

        return Ok(new
        {
            TotalCount = totalCount,
            totalPerfectCombo,
            totalHasReplay,
            totalSS,
            totalS,
            totalA,
            averageAccuracy,
            averageCombo,
            averagePp,
            Count = count,
            CountByMonth = countByMonth,
            CountByHour = countByHour
        });
    }
}