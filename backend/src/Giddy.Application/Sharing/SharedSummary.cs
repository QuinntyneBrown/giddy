namespace Giddy.Application.Sharing;

/// <summary>What anyone with the view-only link sees: no guests' contact details or allergies.</summary>
public sealed record SharedSummary(
    string Name,
    string? ChildName,
    string Date,
    string StartsAt,
    string EndsAt,
    string? Theme,
    string? Venue,
    int Coming,
    IReadOnlyList<string> Plan);
