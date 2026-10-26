using Giddy.Application.Common;
using Giddy.Domain.Notifications;
using Microsoft.EntityFrameworkCore;
using NodaTime;

namespace Giddy.Application.Notifications;

/// <summary>
/// Queues messages for parents, holding non-urgent ones through quiet hours, and sends the ones
/// that are due. Each message has a key so the same reminder is never queued twice.
/// </summary>
public sealed class NotificationOutbox(IGiddyDbContext db, IEmailSender email, IClock clock)
{
    /// <param name="urgentOn">The party date when the message is urgent on that day; otherwise null.</param>
    public async Task QueueAsync(Guid parentId, string subject, string body, LocalDate? urgentOn, string key, CancellationToken cancellationToken)
    {
        if (await db.Notifications.AnyAsync(n => n.Key == key, cancellationToken))
        {
            return;
        }

        var now = clock.GetCurrentInstant();
        db.Notifications.Add(new ScheduledNotification(parentId, key, subject, body, now, QuietHours.SendAt(now, urgentOn)));
        await db.SaveChangesAsync(cancellationToken);
    }

    public async Task DispatchDueAsync(CancellationToken cancellationToken)
    {
        var now = clock.GetCurrentInstant();
        var due = await db.Notifications.Where(n => n.SentAt == null && n.SendAt <= now).ToListAsync(cancellationToken);
        if (due.Count == 0)
        {
            return;
        }

        var ids = due.Select(n => n.ParentId).Distinct().ToList();
        var parents = await db.Parents.Where(p => ids.Contains(p.Id)).ToDictionaryAsync(p => p.Id, cancellationToken);
        foreach (var notification in due)
        {
            if (parents.TryGetValue(notification.ParentId, out var parent))
            {
                await email.SendAsync(new EmailMessage(parent.Email, notification.Subject, notification.Body), cancellationToken);
            }

            notification.MarkSent(now);
        }

        await db.SaveChangesAsync(cancellationToken);
    }
}
