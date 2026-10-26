using Giddy.Api.Security;
using Giddy.Application.Vendors.Quotes;
using Giddy.Application.Vendors.Search;
using MediatR;

namespace Giddy.Api.Endpoints;

public static class VendorEndpoints
{
    public static IEndpointRouteBuilder MapVendorEndpoints(this IEndpointRouteBuilder app)
    {
        app.MapGet("/api/vendors/search", (Guid partyId, string? category, string? theme, decimal? maxPrice, ISender sender, CancellationToken cancel) =>
            sender.Send(new SearchVendorsQuery(partyId, category ?? "entertainers", theme, maxPrice), cancel));
        var quotes = app.MapGroup("/api/parties/{partyId:guid}/quotes");

        quotes.MapPost("/", async (Guid partyId, RequestQuoteRequest request, ISender sender, CancellationToken cancel) =>
        {
            var quote = await sender.Send(
                new RequestQuoteCommand(partyId, request.VendorId, request.Date ?? string.Empty, request.Start ?? string.Empty, request.Kids, request.Location ?? string.Empty, request.Message ?? string.Empty),
                cancel);
            return Results.Created($"/api/parties/{partyId}/quotes/{quote.Id}", quote);
        });

        quotes.MapPost("/{quoteId:guid}/confirm", async (Guid partyId, Guid quoteId, ISender sender, CancellationToken cancel) =>
        {
            await sender.Send(new ConfirmQuoteCommand(partyId, quoteId), cancel);
            return Results.NoContent();
        });

        // The vendor directory's webhook, authenticated by a shared secret from configuration.
        app.MapPost("/api/vendor-quotes", async (HttpRequest http, VendorQuoteRequest request, IConfiguration configuration, ISender sender, CancellationToken cancel) =>
        {
            if (!SharedSecret.Matches(configuration["Giddy:VendorQuotesSecret"], http.Headers[SharedSecret.Header].ToString()))
            {
                return Results.Unauthorized();
            }

            await sender.Send(new RecordVendorQuoteCommand(request.RequestId, request.Amount, request.ExpiresOn ?? string.Empty, request.Note), cancel);
            return Results.Accepted();
        }).AllowAnonymous();

        return app;
    }
}
