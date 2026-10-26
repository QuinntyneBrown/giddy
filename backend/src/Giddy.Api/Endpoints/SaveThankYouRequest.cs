namespace Giddy.Api.Endpoints;

/// <param name="Message">The parent's own wording; null keeps Giddy's draft.</param>
public sealed record SaveThankYouRequest(string? Gift, string? Message);
