using Giddy.Application.Guests.GetGuests;
using MediatR;

namespace Giddy.Api.Endpoints;

public static class GuestEndpoints
{
    public static IEndpointRouteBuilder MapGuestEndpoints(this IEndpointRouteBuilder app)
    {
        var party = app.MapGroup("/api/parties/{partyId:guid}");

        party.MapGet("/guests", (Guid partyId, ISender sender, CancellationToken cancel) =>
            sender.Send(new GetGuestsQuery(partyId), cancel));

        return app;
    }
}
