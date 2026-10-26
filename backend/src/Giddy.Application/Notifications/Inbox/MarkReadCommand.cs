using MediatR;

namespace Giddy.Application.Notifications.Inbox;

/// <param name="ItemId">One item; null marks every item read.</param>
public sealed record MarkReadCommand(Guid? ItemId) : IRequest<UnreadCount>;
