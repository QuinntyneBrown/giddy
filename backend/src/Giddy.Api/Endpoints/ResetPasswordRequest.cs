namespace Giddy.Api.Endpoints;

public sealed record ResetPasswordRequest(string? Token, string? Password, string? Confirm);
