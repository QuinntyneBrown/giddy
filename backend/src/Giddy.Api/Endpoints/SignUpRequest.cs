namespace Giddy.Api.Endpoints;

public sealed record SignUpRequest(string? FirstName, string? Email, string? Password, string? PostalCode, bool Marketing);
