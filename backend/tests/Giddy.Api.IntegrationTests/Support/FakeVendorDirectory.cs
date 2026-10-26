using System.Collections.Concurrent;
using Giddy.Application.Vendors;
using Giddy.Domain.Catalogue;

namespace Giddy.Api.IntegrationTests.Support;

public sealed class FakeVendorDirectory : IVendorDirectory
{
    public ConcurrentBag<(string Vendor, QuoteRequestDetails Details)> Requests { get; } = [];

    public Task RequestQuoteAsync(CatalogueItem vendor, QuoteRequestDetails details, CancellationToken cancellationToken)
    {
        Requests.Add((vendor.Name, details));
        return Task.CompletedTask;
    }
}
