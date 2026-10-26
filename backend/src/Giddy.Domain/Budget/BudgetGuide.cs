namespace Giddy.Domain.Budget;

/// <summary>
/// The typical all-in spend for a kids' party in Toronto by guest count, HST included. Based on
/// Giddy's GTA price guide: a base cost plus a per-child cost, rounded to friendly numbers.
/// </summary>
public static class BudgetGuide
{
    public static (decimal Low, decimal High) TypicalFor(int guests)
    {
        var low = 300m + (20m * guests);
        var high = 500m + (38m * guests);
        return (Math.Floor(low / 50m) * 50m, Math.Round(high / 100m, MidpointRounding.AwayFromZero) * 100m);
    }
}
