namespace Giddy.Api.Endpoints;

public sealed record SmsEventRequest(string? From, string? Text);
