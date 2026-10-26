using Giddy.Application.Parties.ApplyPlan;
using Giddy.Application.Parties.CreateParty;
using Giddy.Application.Parties.DeleteParty;
using Giddy.Application.Parties.GetPartyBookings;
using Giddy.Application.Parties.GetPartyOverview;
using Giddy.Application.Parties.StartPartyConversation;
using Giddy.Application.Parties.GetMyParties;
using Giddy.Application.Parties.GetParty;
using Giddy.Application.Parties.RenameParty;
using MediatR;

namespace Giddy.Api.Endpoints;

public static class PartyEndpoints
{
    public static IEndpointRouteBuilder MapPartyEndpoints(this IEndpointRouteBuilder app)
    {
        var parties = app.MapGroup("/api/parties");

        parties.MapGet("/", (ISender sender, CancellationToken cancel) => sender.Send(new GetMyPartiesQuery(), cancel));

        parties.MapGet("/{partyId:guid}", (Guid partyId, ISender sender, CancellationToken cancel) =>
            sender.Send(new GetPartyQuery(partyId), cancel));

        parties.MapPut("/{partyId:guid}", (Guid partyId, RenamePartyRequest request, ISender sender, CancellationToken cancel) =>
            sender.Send(new RenamePartyCommand(partyId, request.Name ?? string.Empty), cancel));

        parties.MapPost("/", async (CreatePartyCommand command, ISender sender, CancellationToken cancel) =>
        {
            var party = await sender.Send(command, cancel);
            return Results.Created($"/api/parties/{party.Id}", party);
        });

        parties.MapGet("/{partyId:guid}/overview", (Guid partyId, ISender sender, CancellationToken cancel) =>
            sender.Send(new GetPartyOverviewQuery(partyId), cancel));

        parties.MapGet("/{partyId:guid}/bookings", (Guid partyId, ISender sender, CancellationToken cancel) =>
            sender.Send(new GetPartyBookingsQuery(partyId), cancel));

        parties.MapDelete("/{partyId:guid}", async (Guid partyId, ISender sender, CancellationToken cancel) =>
        {
            await sender.Send(new DeletePartyCommand(partyId), cancel);
            return Results.NoContent();
        });

        parties.MapPost("/{partyId:guid}/conversations", (Guid partyId, ISender sender, CancellationToken cancel) =>
            sender.Send(new StartPartyConversationCommand(partyId), cancel));

        parties.MapPost("/{partyId:guid}/plan", (Guid partyId, ApplyPlanRequest request, ISender sender, CancellationToken cancel) =>
            sender.Send(new ApplyPlanCommand(partyId, request.ProposalId), cancel));

        return app;
    }
}
