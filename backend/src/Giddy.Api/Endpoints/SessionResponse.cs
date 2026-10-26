namespace Giddy.Api.Endpoints;

public sealed record SessionResponse(Guid ParentId, string Name, string Email, bool EmailVerified, bool EmailBounced);
