using MediatR;

namespace Giddy.Application.Vendors.Quotes;

/// <summary>A vendor's reply to a quote request, from the vendor directory's webhook.</summary>
public sealed record RecordVendorQuoteCommand(Guid RequestId, decimal Amount, string ExpiresOn, string? Note) : IRequest;
