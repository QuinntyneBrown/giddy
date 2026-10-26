namespace Giddy.Application.Notifications.Inbox;

/// <param name="Items">Unread first, then earlier ones, newest first in each; the last 90 days.</param>
public sealed record InboxView(int Unread, IReadOnlyList<InboxItemView> Items);
