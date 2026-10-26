namespace Giddy.Api.Endpoints;

public sealed record TaskRequest(string? Title, string? Due, Guid? OwnerId, bool RemindMe);
