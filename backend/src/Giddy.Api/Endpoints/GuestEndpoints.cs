using Giddy.Application.Guests.GetGuests;
using Giddy.Application.Guests.SendReminders;
using MediatR;

namespace Giddy.Api.Endpoints;

public static class GuestEndpoints
{
    public static IEndpointRouteBuilder MapGuestEndpoints(this IEndpointRouteBuilder app)
    {
        var party = app.MapGroup("/api/parties/{partyId:guid}");

        party.MapGet("/guests", (Guid partyId, ISender sender, CancellationToken cancel) =>
            sender.Send(new GetGuestsQuery(partyId), cancel));

        party.MapPost("/reminders", (Guid partyId, RemindRequest request, ISender sender, CancellationToken cancel) =>
            sender.Send(new SendRemindersCommand(partyId, request.GuestIds ?? []), cancel));

        return app;
    }
}
