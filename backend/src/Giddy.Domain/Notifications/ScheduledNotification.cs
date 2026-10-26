using NodaTime;

namespace Giddy.Domain.Notifications;

/// <summary>A message for a parent, held until it may be sent (quiet hours) and sent once.</summary>
public sealed class ScheduledNotification
{
    private ScheduledNotification()
    {
        Key = string.Empty;
        Subject = string.Empty;
        Body = string.Empty;
    }

    public ScheduledNotification(Guid parentId, NotificationCategory category, string key, string subject, string body, string link, Instant dueAt, Instant sendAt)
    {
        Id = Guid.NewGuid();
        ParentId = parentId;
        Category = category;
        Link = link;
        Key = key;
        Subject = subject;
        Body = body;
        DueAt = dueAt;
        SendAt = sendAt;
    }

    public Guid Id { get; private set; }

    public Guid ParentId { get; private set; }

    public NotificationCategory Category { get; private set; }

    /// <summary>The page in the web app it is about.</summary>
    public string Link { get; private set; } = "/";

    /// <summary>Unique: the same reminder or digest is never queued twice.</summary>
    public string Key { get; private set; }

    public string Subject { get; private set; }

    public string Body { get; private set; }

    public Instant DueAt { get; private set; }

    /// <summary>The due time, or the end of quiet hours when it fell inside them.</summary>
    public Instant SendAt { get; private set; }

    public Instant? SentAt { get; private set; }

    public void MarkSent(Instant now) => SentAt = now;
}
