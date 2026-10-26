using NodaTime;

namespace Giddy.Domain.Parties;

/// <summary>Giddy's standard checklist, each task dated a set number of days before the party.</summary>
public static class ChecklistGenerator
{
    private static readonly (string Title, int DaysBefore, string? GiddyAction)[] Steps =
    [
        ("Book the venue", 28, null),
        ("Book the entertainer", 25, null),
        ("Send invitations", 21, null),
        ("Order the cake", 10, null),
        (Party.AllergyListTask, 10, GiddyActions.AllergyList),
        ("Order loot bags", 10, null),
        ("Send an RSVP reminder", 7, GiddyActions.RsvpReminder),
        ("Confirm final numbers with the venue", 3, null),
        ("Order the food", 2, null),
        ("Pack the party-day kit", 1, null),
    ];

    public static IReadOnlyList<ChecklistTask> For(LocalDate partyDate, LocalDate today) =>
        Steps.Select(step =>
        {
            var due = partyDate.PlusDays(-step.DaysBefore);
            return new ChecklistTask(step.Title, due < today ? today : due) { GiddyAction = step.GiddyAction };
        }).ToList();
}
