namespace Giddy.Application.Home;

/// <summary>The soonest upcoming party, for the Home hero.</summary>
public sealed record HomeParty(
    Guid Id,
    string Name,
    string Date,
    string StartsAt,
    string EndsAt,
    int DaysToGo,
    string? VenueName,
    int? Guests,
    int Readiness,
    int DoneSteps,
    int TotalSteps,
    string? NextStep);
