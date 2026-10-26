using Giddy.Application.Wrapping;
using MediatR;

namespace Giddy.Api.Endpoints;

/// <summary>After the party: thank-you notes, ratings, final numbers and the saved plan.</summary>
public static class WrapUpEndpoints
{
    public static IEndpointRouteBuilder MapWrapUpEndpoints(this IEndpointRouteBuilder app)
    {
        var party = app.MapGroup("/api/parties/{partyId:guid}");
        party.MapGet("/wrap-up", (Guid partyId, ISender sender, CancellationToken cancel) => sender.Send(new GetWrapUpQuery(partyId), cancel));
        party.MapPut("/thank-yous/{guestId:guid}", async (Guid partyId, Guid guestId, SaveThankYouRequest request, ISender sender, CancellationToken cancel) =>
        {
            await sender.Send(new SaveThankYouCommand(partyId, guestId, request.Gift, request.Message), cancel);
            return Results.Ok();
        });
        party.MapPost("/thank-yous/send", (Guid partyId, ISender sender, CancellationToken cancel) => sender.Send(new SendThankYousCommand(partyId), cancel));
        party.MapPut("/ratings/{providerId:guid}", (Guid partyId, Guid providerId, RateRequest request, ISender sender, CancellationToken cancel) =>
            sender.Send(new RateProviderCommand(partyId, providerId, request.Stars, request.Review), cancel));
        party.MapPost("/template", async (Guid partyId, ISender sender, CancellationToken cancel) =>
        {
            var saved = await sender.Send(new SaveTemplateCommand(partyId), cancel);
            return saved.Created ? Results.Created($"/api/templates/{saved.Template.TemplateId}", saved.Template) : Results.Ok(saved.Template);
        });

        app.MapGet("/api/templates/{templateId:guid}", (Guid templateId, ISender sender, CancellationToken cancel) =>
            sender.Send(new GetTemplateQuery(templateId), cancel));

        return app;
    }
}
