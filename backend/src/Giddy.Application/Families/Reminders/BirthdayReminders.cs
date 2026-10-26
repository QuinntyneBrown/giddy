using Giddy.Application.Notifications;
using Giddy.Application.Common;
using Giddy.Domain.Calendar;
using Microsoft.EntityFrameworkCore;
using NodaTime;

namespace Giddy.Application.Families.Reminders;

/// <summary>
/// From 9:00 am Toronto time: for each child whose birthday is six weeks away and has no party
/// planned for it, a nudge to the family to start planning. Safe to run every minute.
/// </summary>
public sealed class BirthdayReminders(IGiddyDbContext db, NotificationOutbox outbox, IWebLinks links, IClock clock)
{
    public const int DaysAhead = 42;

    public async Task RunAsync(CancellationToken cancellationToken)
    {
        var now = clock.GetCurrentInstant().InZone(TorontoCalendar.Zone);
        if (now.TimeOfDay < new LocalTime(9, 0))
        {
            return;
        }

        var today = now.Date;
        var birthday = today.PlusDays(DaysAhead);
        foreach (var family in await db.Families.ToListAsync(cancellationToken))
        {
            foreach (var child in family.Children.Where(c => c.NextBirthday(today) == birthday))
            {
                var parties = await db.Parties.Where(p => p.ChildId == child.Id).ToListAsync(cancellationToken);
                if (ChildViews.PartyFor(child, parties, today) is not null)
                {
                    continue;
                }

                await outbox.QueueAsync(
                    family.Id,
                    $"{child.FirstName} turns {child.TurningAge(today)} in 6 weeks",
                    $"{child.FirstName}’s birthday is on {birthday:dddd d MMMM}. Now’s a great time to start planning, while the best venues are still free:\n{links.To($"/parties/new?child={child.Id}")}",
                    null,
                    $"birthday:{child.Id}:{birthday:yyyy-MM-dd}",
                    cancellationToken);
            }
        }
    }
}
