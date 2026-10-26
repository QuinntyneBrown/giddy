using Giddy.Application.Common;
using Giddy.Domain.Calendar;
using Giddy.Domain.Parties;
using Microsoft.EntityFrameworkCore;

namespace Giddy.Application.Checklist.View;

/// <summary>
/// The checklist as the parent sees it today in Toronto: overdue, due this week (the next seven
/// days), due before the party, and done, each in date order.
/// </summary>
public sealed class ChecklistProjection(IGiddyDbContext db, TorontoCalendar calendar, ICurrentParent parent)
{
    public async Task<ChecklistView> ViewAsync(Party party, CancellationToken cancellationToken)
    {
        var names = await NamesAsync(party, cancellationToken);
        var today = calendar.Today;
        var ordered = party.Checklist.OrderBy(t => t.Due).ToList();
        var tasks = ordered.Select(t => View(party, t, names, today)).ToList();
        var done = tasks.Count(t => t.Done);
        return new ChecklistView(
            done,
            tasks.Count,
            tasks.Count == 0 ? 0 : (int)Math.Round(100.0 * done / tasks.Count),
            tasks.Count(t => t.Overdue),
            tasks.FirstOrDefault(t => !t.Done)?.Title,
            Iso(party.Date),
            [
                new TaskGroup("Overdue", tasks.Where(t => t.Overdue).ToList()),
                new TaskGroup("This week", Pick(ordered, tasks, t => !t.Done && t.Due >= today && t.Due < today.PlusDays(7))),
                new TaskGroup("Before the party", Pick(ordered, tasks, t => !t.Done && t.Due >= today.PlusDays(7))),
                new TaskGroup("Done", tasks.Where(t => t.Done).ToList()),
            ],
            party.Members
                .Where(m => m.Role != PartyRole.Viewer)
                .OrderBy(m => m.Role)
                .Select(m => new Planner(m.ParentId, names.GetValueOrDefault(m.ParentId, "A planner"), m.ParentId == parent.Id))
                .ToList());
    }

    public async Task<TaskView> TaskAsync(Party party, ChecklistTask task, CancellationToken cancellationToken) =>
        View(party, task, await NamesAsync(party, cancellationToken), calendar.Today);

    private static string Iso(NodaTime.LocalDate date) => NodaTime.Text.LocalDatePattern.Iso.Format(date);

    private static List<TaskView> Pick(List<ChecklistTask> tasks, List<TaskView> views, Func<ChecklistTask, bool> keep) =>
        tasks.Select((task, i) => (task, view: views[i])).Where(x => keep(x.task)).Select(x => x.view).ToList();

    private async Task<Dictionary<Guid, string>> NamesAsync(Party party, CancellationToken cancellationToken)
    {
        var ids = party.Members.Select(m => m.ParentId).ToList();
        return await db.Parents.Where(p => ids.Contains(p.Id)).ToDictionaryAsync(p => p.Id, p => p.Name, cancellationToken);
    }

    private static TaskView View(Party party, ChecklistTask task, Dictionary<Guid, string> names, NodaTime.LocalDate today)
    {
        var owner = task.OwnerId ?? party.OwnerId;
        return new TaskView(
            task.TaskId,
            task.Title,
            Iso(task.Due),
            task.Done,
            task.DoneOn is { } doneOn ? Iso(doneOn) : null,
            !task.Done && task.Due < today,
            owner,
            names.GetValueOrDefault(owner, "A planner"),
            task.RemindMe,
            task.Done ? null : task.GiddyAction);
    }
}
