using NodaTime;

namespace Giddy.Domain.Notifications;

/// <summary>An entry in a parent's notification centre.</summary>
public sealed class InboxItem
{
    /// <summary>The centre shows the last 90 days.</summary>
    public static readonly Duration Kept = Duration.FromDays(90);

    private InboxItem()
    {
        Icon = string.Empty;
        Title = string.Empty;
        Detail = string.Empty;
        Link = string.Empty;
    }

    public InboxItem(Guid parentId, string icon, string title, string detail, string link, Instant createdAt)
    {
        Id = Guid.NewGuid();
        ParentId = parentId;
        Icon = icon;
        Title = title;
        Detail = detail;
        Link = link;
        CreatedAt = createdAt;
    }

    public Guid Id { get; private set; }

    public Guid ParentId { get; private set; }

    /// <summary>An emoji, such as 💌 for a reply.</summary>
    public string Icon { get; private set; }

    public string Title { get; private set; }

    public string Detail { get; private set; }

    /// <summary>The page in the web app it is about.</summary>
    public string Link { get; private set; }

    public Instant CreatedAt { get; private set; }

    public Instant? ReadAt { get; private set; }

    public void MarkRead(Instant now) => ReadAt ??= now;
}
