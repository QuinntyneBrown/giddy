namespace Giddy.Api.Endpoints;

public sealed record RemindRequest(IReadOnlyList<Guid>? GuestIds);
