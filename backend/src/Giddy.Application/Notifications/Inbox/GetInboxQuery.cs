using MediatR;

namespace Giddy.Application.Notifications.Inbox;

public sealed record GetInboxQuery : IRequest<InboxView>;
