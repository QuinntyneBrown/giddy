namespace Giddy.Domain.Parties;

/// <summary>A cost the parent tracks themselves, outside Giddy's bookings, in tax-inclusive Canadian dollars.</summary>
/// <param name="CostId">Not named Id: in the JSON column EF keys owned items by position, not by this value.</param>
public sealed record Expense(Guid CostId, string Description, string Category, decimal Amount, bool Paid);
