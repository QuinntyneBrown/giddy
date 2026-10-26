namespace Giddy.Api.Endpoints;

public sealed record VendorQuoteRequest(Guid RequestId, decimal Amount, string? ExpiresOn, string? Note);
