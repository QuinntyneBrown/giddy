using Giddy.Application.Guests.AddGuest;
using Giddy.Application.Guests.GetGuests;
using Giddy.Application.Guests.SendReminders;
using Giddy.Application.Guests.ShareAllergyList;
using MediatR;

namespace Giddy.Api.Endpoints;

public static class GuestEndpoints
{
    public static IEndpointRouteBuilder MapGuestEndpoints(this IEndpointRouteBuilder app)
    {
        var party = app.MapGroup("/api/parties/{partyId:guid}");

        party.MapGet("/guests", (Guid partyId, ISender sender, CancellationToken cancel) =>
            sender.Send(new GetGuestsQuery(partyId), cancel));

        party.MapPost("/guests", async (Guid partyId, AddGuestRequest request, ISender sender, CancellationToken cancel) =>
        {
            var guest = await sender.Send(
                new AddGuestCommand(partyId, request.ChildName ?? string.Empty, request.ParentName ?? string.Empty, request.Email ?? string.Empty, request.Mobile, request.SendNow),
                cancel);
            return Results.Created($"/api/parties/{partyId}/guests/{guest.Id}", guest);
        });

        party.MapPost("/reminders", (Guid partyId, RemindRequest request, ISender sender, CancellationToken cancel) =>
            sender.Send(new SendRemindersCommand(partyId, request.GuestIds ?? []), cancel));

        party.MapPost("/allergy-list/share", (Guid partyId, ISender sender, CancellationToken cancel) =>
            sender.Send(new ShareAllergyListCommand(partyId), cancel));

        return app;
    }
}
