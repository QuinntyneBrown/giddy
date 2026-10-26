namespace Giddy.Application.Notifications.Inbox;

/// <param name="CreatedAt">ISO instant, for "2 h ago".</param>
public sealed record InboxItemView(Guid Id, string Icon, string Title, string Detail, string Link, string CreatedAt, bool Read);
