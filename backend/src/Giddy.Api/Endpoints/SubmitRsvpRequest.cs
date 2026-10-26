namespace Giddy.Api.Endpoints;

public sealed record SubmitRsvpRequest(bool Coming, string? Allergies, bool? ParentStaying, int? Siblings, string? ParentName, string? Mobile, string? Note);
