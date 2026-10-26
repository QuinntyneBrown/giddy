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

        return app;
    }
}
