using Giddy.Application.Memories;
using MediatR;

namespace Giddy.Api.Endpoints;

public static class MemoryEndpoints
{
    public static IEndpointRouteBuilder MapMemoryEndpoints(this IEndpointRouteBuilder app)
    {
        app.MapGet("/api/memories", (ISender sender, CancellationToken cancel) => sender.Send(new GetMemoriesQuery(), cancel));

        app.MapDelete("/api/memories/{memoryId:guid}", async (Guid memoryId, ISender sender, CancellationToken cancel) =>
        {
            await sender.Send(new ForgetMemoryCommand(memoryId), cancel);
            return Results.NoContent();
        });

        return app;
    }
}
