namespace Giddy.Api.Endpoints;

public sealed record AddGuestRequest(string? ChildName, string? ParentName, string? Email, string? Mobile, bool SendNow);
