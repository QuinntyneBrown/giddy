using Giddy.Application.Parties.GetPartyOverview;

namespace Giddy.Application.Home;

/// <param name="NeedsYou">Unfinished tasks that are overdue or due this week.</param>
public sealed record HomeView(
    int PartiesInProgress,
    int NeedsYou,
    HomeParty? NextParty,
    RsvpCounts Rsvps,
    int Allergies,
    UpcomingBirthday? NextBirthday);
