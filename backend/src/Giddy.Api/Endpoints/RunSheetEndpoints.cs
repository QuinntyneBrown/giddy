using Giddy.Application.RunSheets;
using MediatR;

namespace Giddy.Api.Endpoints;

public static class RunSheetEndpoints
{
    public static IEndpointRouteBuilder MapRunSheetEndpoints(this IEndpointRouteBuilder app)
    {
        var sheet = app.MapGroup("/api/parties/{partyId:guid}/run-sheet");

        sheet.MapGet("/", (Guid partyId, ISender sender, CancellationToken cancel) =>
            sender.Send(new GetRunSheetQuery(partyId), cancel));

        sheet.MapPost("/draft", (Guid partyId, ISender sender, CancellationToken cancel) =>
            sender.Send(new DraftRunSheetCommand(partyId), cancel));

        return app;
    }
}
