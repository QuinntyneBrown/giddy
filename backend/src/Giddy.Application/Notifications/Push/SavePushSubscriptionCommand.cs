using MediatR;

namespace Giddy.Application.Notifications.Push;

public sealed record SavePushSubscriptionCommand(string Endpoint, string P256dh, string Auth) : IRequest;
