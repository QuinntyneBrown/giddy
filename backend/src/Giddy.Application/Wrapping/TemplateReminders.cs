using Giddy.Application.Common;
using Giddy.Application.Notifications;
using Giddy.Domain;
using Giddy.Domain.Calendar;
using Giddy.Domain.Families;
using Giddy.Domain.Notifications;
using Microsoft.EntityFrameworkCore;
using NodaTime;

namespace Giddy.Application.Wrapping;

/// <summary>
/// From 9:00 am Toronto time on a saved plan's reminder date, a nudge to start next year's party
/// from it. Sent once; safe to run every minute.
/// </summary>
public sealed class TemplateReminders(IGiddyDbContext db, NotificationOutbox outbox, IWebLinks links, IClock clock)
{
    public async Task RunAsync(CancellationToken cancellationToken)
    {
        var now = clock.GetCurrentInstant();
        var local = now.InZone(TorontoCalendar.Zone);
        if (local.TimeOfDay < new LocalTime(9, 0))
        {
            return;
        }

        var today = local.Date;
        var due = await db.PartyTemplates.Where(t => t.RemindedAt == null && t.RemindOn != null).ToListAsync(cancellationToken);
        foreach (var template in due.Where(t => t.RemindOn <= today))
        {
            var link = $"/parties/new?template={template.Id}";
            var who = template.ChildName ?? "your child";
            var next = await NextBirthdayAsync(template, today, cancellationToken);
            await outbox.QueueAsync(
                template.OwnerId,
                NotificationCategory.Reminders,
                next is { } age ? $"Plan {who}’s {Ordinal.Of(age)} from last year’s party?" : "Plan this year’s party from last year’s?",
                $"Your plan for {template.Name} is saved: the same theme, venue, vendors and checklist. Start this year’s party from it:\n{links.To(link)}",
                link,
                null,
                $"template:{template.Id}",
                cancellationToken);
            template.Reminded(now);
            await db.SaveChangesAsync(cancellationToken);
        }
    }

    private async Task<int?> NextBirthdayAsync(Domain.Wrapping.PartyTemplate template, LocalDate today, CancellationToken cancellationToken)
    {
        if (template.ChildId is not { } childId)
        {
            return null;
        }

        var family = await db.Families.SingleOrDefaultAsync(f => f.Id == template.OwnerId, cancellationToken);
        return family?.Children.SingleOrDefault(c => c.Id == childId) is Child child ? child.TurningAge(today) : null;
    }
}
