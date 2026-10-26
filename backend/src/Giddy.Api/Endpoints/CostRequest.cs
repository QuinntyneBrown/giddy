namespace Giddy.Api.Endpoints;

public sealed record CostRequest(string? Description, string? Category, decimal Amount, bool Paid);
