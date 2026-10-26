using Giddy.Domain.Catalogue;

namespace Giddy.Application.Vendors;

/// <summary>Sends quote requests to vendors; their replies come back through the vendor-quotes webhook.</summary>
public interface IVendorDirectory
{
    Task RequestQuoteAsync(CatalogueItem vendor, QuoteRequestDetails details, CancellationToken cancellationToken);
}
