using Giddy.Application.Common;
using Giddy.Domain.Notifications;
using Microsoft.EntityFrameworkCore;
using NodaTime;

namespace Giddy.Application.Notifications;

/// <summary>
/// Queues messages for parents and sends them by the channels each parent chose for that category:
/// email, text and push. It also puts each message in the notification centre. Non-urgent
/// messages wait out the parent's quiet hours. Each message has a key so it is queued only once.
/// </summary>
public sealed class NotificationOutbox(IGiddyDbContext db, IEmailSender email, Texts texts, IPushSender push, IWebLinks links, IClock clock)
{
    /// <param name="urgentOn">The party date when the message is urgent on that day; otherwise null.</param>
    public async Task QueueAsync(
        Guid parentId, NotificationCategory category, string subject, string body, string link, LocalDate? urgentOn, string key, CancellationToken cancellationToken)
    {
        if (await db.Notifications.AnyAsync(n => n.Key == key, cancellationToken))
        {
            return;
        }

        var now = clock.GetCurrentInstant();
        var quiet = await db.Parents.Where(p => p.Id == parentId).Select(p => (bool?)p.QuietHours).SingleOrDefaultAsync(cancellationToken) ?? true;
        db.Notifications.Add(new ScheduledNotification(parentId, category, key, subject, body, link, now, quiet ? QuietHours.SendAt(now, urgentOn) : now));
        db.InboxItems.Add(new InboxItem(parentId, CategoryIcons.For(category), subject, FirstLine(body), link, now));
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
        var subscriptions = await db.PushSubscriptions.Where(s => ids.Contains(s.ParentId)).ToListAsync(cancellationToken);
        foreach (var notification in due)
        {
            if (parents.TryGetValue(notification.ParentId, out var parent))
            {
                var channels = parent.Channels(notification.Category);
                if (channels.Email)
                {
                    await email.SendAsync(new EmailMessage(parent.Email, notification.Subject, notification.Body), cancellationToken);
                }

                if (channels.Text && parent.Mobile is { } mobile)
                {
                    await texts.SendAsync(mobile, $"{notification.Subject}. {links.To(notification.Link)}", cancellationToken);
                }

                if (channels.Push)
                {
                    foreach (var subscription in subscriptions.Where(s => s.ParentId == parent.Id))
                    {
                        await push.SendAsync(subscription, notification.Subject, FirstLine(notification.Body), notification.Link, cancellationToken);
                    }
                }
            }

            notification.MarkSent(now);
        }

        await db.SaveChangesAsync(cancellationToken);
    }

    /// <summary>The notification centre keeps 90 days; older entries are deleted.</summary>
    public async Task PurgeAsync(CancellationToken cancellationToken)
    {
        var cutoff = clock.GetCurrentInstant() - InboxItem.Kept;
        db.InboxItems.RemoveRange(await db.InboxItems.Where(i => i.CreatedAt < cutoff).ToListAsync(cancellationToken));
        db.Notifications.RemoveRange(await db.Notifications.Where(n => n.SentAt != null && n.SentAt < cutoff).ToListAsync(cancellationToken));
        await db.SaveChangesAsync(cancellationToken);
    }

    private static string FirstLine(string body) => body.Split('\n')[0];
}
