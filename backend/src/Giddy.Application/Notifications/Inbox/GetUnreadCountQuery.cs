using MediatR;

namespace Giddy.Application.Notifications.Inbox;

public sealed record GetUnreadCountQuery : IRequest<UnreadCount>;
