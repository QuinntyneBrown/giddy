using Giddy.Application.Places.CheckServiceArea;
using MediatR;

namespace Giddy.Api.Endpoints;

public static class ServiceAreaEndpoints
{
    public static IEndpointRouteBuilder MapServiceAreaEndpoints(this IEndpointRouteBuilder app)
    {
        app.MapGet("/api/service-area", (string? postalCode, ISender sender, CancellationToken cancel) =>
            sender.Send(new CheckServiceAreaQuery(postalCode ?? string.Empty), cancel));
        return app;
    }
}
