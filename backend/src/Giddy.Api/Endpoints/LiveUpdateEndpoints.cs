using Giddy.Application.Live;
using MediatR;

namespace Giddy.Api.Endpoints;

public static class LiveUpdateEndpoints
{
    /// <summary>The web app polls this every few seconds while it is open.</summary>
    public static IEndpointRouteBuilder MapLiveUpdateEndpoints(this IEndpointRouteBuilder app)
    {
        app.MapGet("/api/live-updates", (long? after, ISender sender, CancellationToken cancel) =>
            sender.Send(new GetLiveUpdatesQuery(after), cancel));
        return app;
    }
}
