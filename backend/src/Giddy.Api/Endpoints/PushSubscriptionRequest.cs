namespace Giddy.Api.Endpoints;

public sealed record PushSubscriptionRequest(string? Endpoint, string? P256dh, string? Auth);
