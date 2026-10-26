using Giddy.Application.Budget;
using Giddy.Application.Families;
using Giddy.Application.Home;
using MediatR;

namespace Giddy.Api.Endpoints;

public static class HomeEndpoints
{
    public static IEndpointRouteBuilder MapHomeEndpoints(this IEndpointRouteBuilder app)
    {
        app.MapGet("/api/home", (ISender sender, CancellationToken cancel) => sender.Send(new GetHomeQuery(), cancel));
        app.MapGet("/api/home/nudges", (ISender sender, CancellationToken cancel) => sender.Send(new GetNudgesQuery(), cancel));
        app.MapGet("/api/family", (ISender sender, CancellationToken cancel) => sender.Send(new GetFamilyQuery(), cancel));
        app.MapGet("/api/budget-guide", (int? guests, ISender sender, CancellationToken cancel) =>
            sender.Send(new GetBudgetGuideQuery(guests ?? 0), cancel));
        return app;
    }
}
