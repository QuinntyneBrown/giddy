namespace Giddy.Api.Endpoints;

public sealed record ChildRequest(string? FirstName, string? Birthday, string[]? Interests, string? Allergies);
