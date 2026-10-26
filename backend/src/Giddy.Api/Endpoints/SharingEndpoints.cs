using Giddy.Application.Sharing;
using MediatR;

namespace Giddy.Api.Endpoints;

/// <summary>Planning together: planners, invitations, and the view-only link.</summary>
public static class SharingEndpoints
{
    public static IEndpointRouteBuilder MapSharingEndpoints(this IEndpointRouteBuilder app)
    {
        var members = app.MapGroup("/api/parties/{partyId:guid}/members");
        members.MapGet("/", (Guid partyId, ISender sender, CancellationToken cancel) => sender.Send(new GetMembersQuery(partyId), cancel));
        members.MapPost("/", async (Guid partyId, InviteMemberRequest request, ISender sender, CancellationToken cancel) =>
        {
            await sender.Send(new InviteMemberCommand(partyId, request.Email ?? string.Empty, request.Role), cancel);
            return Results.Created($"/api/parties/{partyId}/members", null);
        });
        members.MapDelete("/{parentId:guid}", async (Guid partyId, Guid parentId, ISender sender, CancellationToken cancel) =>
        {
            await sender.Send(new RemoveMemberCommand(partyId, parentId), cancel);
            return Results.NoContent();
        });

        app.MapPost("/api/parties/{partyId:guid}/share-link", (Guid partyId, ISender sender, CancellationToken cancel) =>
            sender.Send(new CreateShareLinkCommand(partyId), cancel));

        app.MapPost("/api/parties/join", (TokenRequest request, ISender sender, CancellationToken cancel) =>
            sender.Send(new JoinPartyCommand(request.Token ?? string.Empty), cancel));

        // Anyone with the link can see the summary: it is the credential, like an RSVP link.
        app.MapGet("/api/shared/{token}", (string token, ISender sender, CancellationToken cancel) =>
            sender.Send(new GetSharedSummaryQuery(token), cancel))
            .AllowAnonymous()
            .RequireRateLimiting(Security.RateLimitSetup.Rsvp);

        return app;
    }
}
