namespace Giddy.Api.Endpoints;

public sealed record RequestQuoteRequest(Guid VendorId, string? Date, string? Start, int Kids, string? Location, string? Message);
