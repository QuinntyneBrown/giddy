using Giddy.Domain.Parties;

namespace Giddy.Application.Parties;

/// <param name="Date">Calendar date in America/Toronto, ISO format.</param>
/// <param name="StartsAt">Local start time, 24-hour "HH:mm".</param>
/// <param name="DaysToGo">Calendar days from today in Toronto; 0 on party day.</param>
/// <param name="Status">upcoming, draft (no plan yet) or past.</param>
/// <param name="Readiness">Whole percent; the same number everywhere.</param>
public sealed record PartySummary(
    Guid Id,
    string Name,
    string Date,
    string StartsAt,
    string EndsAt,
    PartyRole Role,
    int DaysToGo,
    string Status,
    int Readiness,
    string? VenueName,
    string? Theme,
    bool Locked,
    int? Guests,
    decimal? Budget);
