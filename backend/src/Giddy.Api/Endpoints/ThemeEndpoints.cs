using Giddy.Application.Themes;
using MediatR;

namespace Giddy.Api.Endpoints;

public static class ThemeEndpoints
{
    public static IEndpointRouteBuilder MapThemeEndpoints(this IEndpointRouteBuilder app)
    {
        app.MapGet("/api/themes", (Guid? partyId, bool? forChild, string? ageBand, bool? outdoor, bool? budget, ISender sender, CancellationToken cancel) =>
            sender.Send(new GetThemesQuery(partyId, forChild, ageBand, outdoor ?? false, budget ?? false), cancel));

        app.MapPut("/api/parties/{partyId:guid}/theme", (Guid partyId, SetThemeRequest request, ISender sender, CancellationToken cancel) =>
            sender.Send(new SetPartyThemeCommand(partyId, request.ThemeId), cancel));

        return app;
    }
}
