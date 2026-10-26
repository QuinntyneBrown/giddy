namespace Giddy.Application.Vendors;

/// <param name="RequestId">Echoed back with the vendor's quote.</param>
public sealed record QuoteRequestDetails(Guid RequestId, string Date, string Start, int Kids, string Location, string Message, string ParentName);
