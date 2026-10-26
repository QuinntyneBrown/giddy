namespace Giddy.Domain.Notifications;

/// <summary>What a message is about, which decides the channels it goes by.</summary>
public enum NotificationCategory
{
    Rsvps,
    Vendors,
    Reminders,
    /// <summary>Party ideas: marketing, sent only with consent.</summary>
    Ideas,
}
