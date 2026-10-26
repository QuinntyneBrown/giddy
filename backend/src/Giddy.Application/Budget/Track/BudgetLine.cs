namespace Giddy.Application.Budget.Track;

/// <param name="Id">"plan:<category>" for Giddy's items, the cost's id for the parent's own.</param>
/// <param name="Kind">plan or expense; only expenses are edited by hand.</param>
/// <param name="Status">estimate, quoted, booked, depositPaid or paid.</param>
public sealed record BudgetLine(string Id, string Kind, string Category, string Name, string Status, decimal Planned, decimal Paid);
