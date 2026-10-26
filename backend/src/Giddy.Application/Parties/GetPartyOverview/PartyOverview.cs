using Giddy.Domain.Parties;

namespace Giddy.Application.Parties.GetPartyOverview;

/// <summary>Everything the overview shows except booking statuses, which load separately.</summary>
public sealed record PartyOverview(
    Guid Id,
    string Name,
    string Date,
    string StartsAt,
    string EndsAt,
    string TimeOfDay,
    int DaysToGo,
    string? Area,
    string? VenueName,
    string? Theme,
    int? Guests,
    int Readiness,
    int DoneTasks,
    int TotalTasks,
    IReadOnlyList<PartyTaskView> NextTasks,
    string? NextStep,
    IReadOnlyList<string> Allergies,
    decimal? Budget,
    decimal Planned,
    RsvpCounts Rsvps,
    IReadOnlyList<PartyMemberView> Members,
    PartyRole Role,
    bool CanDelete,
    bool Locked);
