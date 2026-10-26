using Giddy.Application.Budget.Costs;
using Giddy.Application.Budget.Swaps;
using Giddy.Application.Budget.Track;
using MediatR;

namespace Giddy.Api.Endpoints;

public static class BudgetEndpoints
{
    public static IEndpointRouteBuilder MapBudgetEndpoints(this IEndpointRouteBuilder app)
    {
        var budget = app.MapGroup("/api/parties/{partyId:guid}/budget");

        budget.MapGet("/", (Guid partyId, ISender sender, CancellationToken cancel) =>
            sender.Send(new GetBudgetQuery(partyId), cancel));

        budget.MapPost("/lines", async (Guid partyId, CostRequest request, ISender sender, CancellationToken cancel) =>
        {
            var line = await sender.Send(new SaveCostCommand(partyId, null, request.Description ?? string.Empty, request.Category ?? string.Empty, request.Amount, request.Paid), cancel);
            return Results.Created($"/api/parties/{partyId}/budget/lines/{line.Id}", line);
        });

        budget.MapPut("/lines/{costId:guid}", (Guid partyId, Guid costId, CostRequest request, ISender sender, CancellationToken cancel) =>
            sender.Send(new SaveCostCommand(partyId, costId, request.Description ?? string.Empty, request.Category ?? string.Empty, request.Amount, request.Paid), cancel));

        budget.MapDelete("/lines/{costId:guid}", async (Guid partyId, Guid costId, ISender sender, CancellationToken cancel) =>
        {
            await sender.Send(new DeleteCostCommand(partyId, costId), cancel);
            return Results.NoContent();
        });

        budget.MapPost("/estimate", (Guid partyId, ISender sender, CancellationToken cancel) =>
            sender.Send(new EstimateBudgetCommand(partyId), cancel));

        budget.MapPost("/swaps", (Guid partyId, SwapRequest request, ISender sender, CancellationToken cancel) =>
            sender.Send(new ApplySwapCommand(partyId, request.Category ?? string.Empty, request.ReplacementId), cancel));

        return app;
    }
}
