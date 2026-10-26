using Giddy.Domain.Notifications;

namespace Giddy.Application.Notifications;

public static class CategoryIcons
{
    public static string For(NotificationCategory category) => category switch
    {
        NotificationCategory.Rsvps => "💌",
        NotificationCategory.Vendors => "🧪",
        NotificationCategory.Reminders => "⏰",
        _ => "🎈",
    };
}
