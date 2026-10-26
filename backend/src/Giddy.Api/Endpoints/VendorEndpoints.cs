using Giddy.Application.Vendors.Search;
using MediatR;

namespace Giddy.Api.Endpoints;

public static class VendorEndpoints
{
    public static IEndpointRouteBuilder MapVendorEndpoints(this IEndpointRouteBuilder app)
    {
        app.MapGet("/api/vendors/search", (Guid partyId, string? category, string? theme, decimal? maxPrice, ISender sender, CancellationToken cancel) =>
            sender.Send(new SearchVendorsQuery(partyId, category ?? "entertainers", theme, maxPrice), cancel));
        return app;
    }
}
