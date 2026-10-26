using NodaTime;

namespace Giddy.Domain.Parties;

/// <summary>Creates the standard planning checklist, dated by working back from the party date.</summary>
public static class ChecklistGenerator
{
    private static readonly (string Title, int DaysBefore)[] Steps =
    [
        ("Book the venue", 28),
        ("Book the entertainer", 25),
        ("Send invitations", 21),
        ("Order the cake", 14),
        ("Share the allergy list with the venue", 10),
        ("Order loot bags", 10),
        ("Send an RSVP reminder", 7),
        ("Confirm the food order", 5),
        ("Confirm final numbers with the venue", 3),
        ("Pack the party-day bag", 1),
    ];

    public static IReadOnlyList<ChecklistTask> For(LocalDate partyDate, LocalDate today) =>
        Steps.Select(step =>
        {
            var due = partyDate.PlusDays(-step.DaysBefore);
            return new ChecklistTask(step.Title, due < today ? today : due);
        }).ToList();
}
