using MediatR;

namespace Giddy.Application.Notifications.Push;

public sealed record RemovePushSubscriptionCommand(string Endpoint) : IRequest;
