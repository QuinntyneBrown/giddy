using System.Globalization;
using Giddy.Application.Common;
using Giddy.Application.Notifications;
using Giddy.Domain.Calendar;
using Microsoft.EntityFrameworkCore;
using NodaTime;
using NodaTime.Text;

namespace Giddy.Application.Checklist.Reminders;

/// <summary>
/// From 9:00 am Toronto time each day: a reminder for each task due tomorrow with "remind me" on,
/// and one digest per planner per party listing every overdue task. Safe to run every minute.
/// </summary>
public sealed class TaskReminders(IGiddyDbContext db, NotificationOutbox outbox, IClock clock)
{
    public static readonly LocalTime RunsAt = new(9, 0);
    private static readonly LocalDatePattern Day = LocalDatePattern.Create("ddd d MMM", CultureInfo.InvariantCulture);

    public async Task RunAsync(CancellationToken cancellationToken)
    {
        var now = clock.GetCurrentInstant().InZone(TorontoCalendar.Zone);
        if (now.TimeOfDay < RunsAt)
        {
            return;
        }

        var today = now.Date;
        var parties = await db.Parties.Where(p => p.Date >= today).ToListAsync(cancellationToken);
        foreach (var party in parties)
        {
            foreach (var task in party.Checklist.Where(t => !t.Done && t.RemindMe && t.Due == today.PlusDays(1)))
            {
                await outbox.QueueAsync(
                    task.OwnerId ?? party.OwnerId,
                    $"{task.Title} is due tomorrow",
                    $"For {party.Name}: {task.Title} is due tomorrow, {Day.Format(task.Due)}. Tick it off on the checklist in Giddy when it’s done.",
                    null,
                    $"task-reminder:{task.TaskId}:{task.Due:yyyy-MM-dd}",
                    cancellationToken);
            }

            foreach (var owner in party.Checklist.Where(t => !t.Done && t.Due < today).GroupBy(t => t.OwnerId ?? party.OwnerId))
            {
                var overdue = owner.OrderBy(t => t.Due).ToList();
                var lines = string.Join("\n", overdue.Select(t => $"- {t.Title}, due {Day.Format(t.Due)}"));
                await outbox.QueueAsync(
                    owner.Key,
                    overdue.Count == 1 ? $"1 task is overdue for {party.Name}" : $"{overdue.Count} tasks are overdue for {party.Name}",
                    $"These checklist tasks for {party.Name} are past their dates:\n{lines}\nTick them off in Giddy when they’re done.",
                    null,
                    $"overdue:{party.Id}:{owner.Key}:{today:yyyy-MM-dd}",
                    cancellationToken);
            }
        }
    }
}
