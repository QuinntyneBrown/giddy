using Giddy.Application.Vendors;
using Giddy.Domain.Catalogue;
using Microsoft.Extensions.Logging;

namespace Giddy.Infrastructure.Vendors;

/// <summary>Records quote requests until a vendor directory provider is connected. Contact details are not logged.</summary>
public sealed class LoggingVendorDirectory(ILogger<LoggingVendorDirectory> logger) : IVendorDirectory
{
    public Task RequestQuoteAsync(CatalogueItem vendor, QuoteRequestDetails details, CancellationToken cancellationToken)
    {
        logger.LogInformation("Quote request {RequestId} queued for {Vendor}", details.RequestId, vendor.Name);
        return Task.CompletedTask;
    }
}
