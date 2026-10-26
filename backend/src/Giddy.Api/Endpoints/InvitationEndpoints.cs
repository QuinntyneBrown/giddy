using Giddy.Application.Invitations.GetInvitation;
using Giddy.Application.Invitations.SaveInvitation;
using Giddy.Application.Invitations.SendInvitations;
using Giddy.Application.Invitations.SendTest;
using MediatR;

namespace Giddy.Api.Endpoints;

public static class InvitationEndpoints
{
    public static IEndpointRouteBuilder MapInvitationEndpoints(this IEndpointRouteBuilder app)
    {
        var invitation = app.MapGroup("/api/parties/{partyId:guid}/invitation");

        invitation.MapGet("/", (Guid partyId, ISender sender, CancellationToken cancel) =>
            sender.Send(new GetInvitationQuery(partyId), cancel));

        invitation.MapPut("/", (Guid partyId, SaveInvitationRequest request, ISender sender, CancellationToken cancel) =>
            sender.Send(
                new SaveInvitationCommand(
                    partyId, request.Design ?? string.Empty, request.Headline ?? string.Empty, request.Message ?? string.Empty,
                    request.RsvpBy ?? string.Empty, request.AskAllergies, request.AskParentStaying, request.AskSiblings,
                    request.ByEmail, request.ByText),
                cancel));

        invitation.MapPost("/test", async (Guid partyId, ISender sender, CancellationToken cancel) =>
        {
            await sender.Send(new SendTestInvitationCommand(partyId), cancel);
            return Results.Accepted();
        });

        invitation.MapPost("/send", (Guid partyId, ISender sender, CancellationToken cancel) =>
            sender.Send(new SendInvitationsCommand(partyId), cancel));

        return app;
    }
}
