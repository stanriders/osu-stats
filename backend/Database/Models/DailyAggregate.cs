namespace osuStats.Database.Models;

public record DailyAggregate
{
    public required DateOnly Date { get; set; }
    public required long Count { get; set; }
}