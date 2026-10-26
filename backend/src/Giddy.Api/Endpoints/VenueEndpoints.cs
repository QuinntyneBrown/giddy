using Giddy.Application.Venues.Compare;
using Giddy.Application.Venues.Detail;
using Giddy.Application.Venues.Favourites;
using Giddy.Application.Venues.Search;
using MediatR;

namespace Giddy.Api.Endpoints;

public static class VenueEndpoints
{
    public static IEndpointRouteBuilder MapVenueEndpoints(this IEndpointRouteBuilder app)
    {
        var venues = app.MapGroup("/api/venues");

        venues.MapGet("/search", (
            Guid? partyId, string? postalCode, string? date, int? guests, int? radiusKm, decimal? maxPrice,
            bool? indoor, bool? nutFree, bool? parking, bool? stepFree, string? sort, ISender sender, CancellationToken cancel) =>
            sender.Send(
                new SearchVenuesQuery(partyId, postalCode, date ?? string.Empty, guests ?? 0, radiusKm ?? 10, maxPrice,
                    indoor ?? false, nutFree ?? false, parking ?? false, stepFree ?? false, sort ?? VenueSort.Best),
                cancel));

        venues.MapGet("/compare", (string? ids, string? date, Guid? partyId, ISender sender, CancellationToken cancel) =>
            sender.Send(
                new CompareVenuesQuery(
                    (ids ?? string.Empty).Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
                        .Select(id => Guid.TryParse(id, out var parsed) ? parsed : Guid.Empty).ToList(),
                    date ?? string.Empty,
                    partyId),
                cancel));

        venues.MapGet("/{venueId:guid}", (Guid venueId, string? date, Guid? partyId, ISender sender, CancellationToken cancel) =>
            sender.Send(new GetVenueQuery(venueId, date ?? string.Empty, partyId), cancel));

        venues.MapPut("/{venueId:guid}/favourite", async (Guid venueId, FavouriteRequest request, ISender sender, CancellationToken cancel) =>
        {
            await sender.Send(new SetFavouriteCommand(venueId, request.Favourite), cancel);
            return Results.NoContent();
        });

        venues.MapPost("/{venueId:guid}/waitlist", async (Guid venueId, WaitlistRequest request, ISender sender, CancellationToken cancel) =>
        {
            await sender.Send(new JoinWaitlistCommand(venueId, request.Date ?? string.Empty, request.PartyId), cancel);
            return Results.Accepted();
        });

        return app;
    }
}
