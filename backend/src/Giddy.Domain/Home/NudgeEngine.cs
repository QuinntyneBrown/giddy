using System.Globalization;
using Giddy.Domain.Parties;
using NodaTime;

namespace Giddy.Domain.Home;

/// <summary>
/// Picks Giddy's nudges: overdue tasks first, then tasks due this week, then ideas, at most three.
/// A nudge disappears when its task is done.
/// </summary>
public static class NudgeEngine
{
    public const int Limit = 3;
    private static readonly Period ThisWeek = Period.FromDays(7);

    public static IReadOnlyList<Nudge> For(IEnumerable<Party> parties, LocalDate today)
    {
        var open = parties
            .Where(p => !p.IsLockedOn(today))
            .SelectMany(p => p.Checklist.Where(t => !t.Done).Select(task => (party: p, task)))
            .ToList();
        var overdue = open.Where(x => x.task.Due < today)
            .OrderBy(x => x.task.Due)
            .Select(x => new Nudge(x.party.Id, x.party.Name, x.task.Title, NudgeKind.Overdue, $"It was due {Format(x.task.Due)}.", "Open the plan"));
        var thisWeek = open.Where(x => x.task.Due >= today && x.task.Due <= today + ThisWeek)
            .OrderBy(x => x.task.Due)
            .Select(x => new Nudge(x.party.Id, x.party.Name, x.task.Title, NudgeKind.NeedsYou, $"Due {Format(x.task.Due)}.", "Open the plan"));
        return overdue.Concat(thisWeek).Take(Limit).ToList();
    }

    public static int NeedingAttention(IEnumerable<Party> parties, LocalDate today) =>
        parties.Where(p => !p.IsLockedOn(today))
            .SelectMany(p => p.Checklist)
            .Count(t => !t.Done && t.Due <= today + ThisWeek);

    private static string Format(LocalDate date) => date.ToString("ddd d MMM", CultureInfo.InvariantCulture);
}
