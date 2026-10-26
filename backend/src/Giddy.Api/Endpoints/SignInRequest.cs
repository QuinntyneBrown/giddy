namespace Giddy.Api.Endpoints;

public sealed record SignInRequest(string? Email, string? Password, bool KeepSignedIn);
