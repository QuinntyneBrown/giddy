using Giddy.Application.Checklist.Generate;
using Giddy.Application.Checklist.GiddyDoes;
using Giddy.Application.Checklist.Tasks;
using Giddy.Application.Checklist.View;
using MediatR;

namespace Giddy.Api.Endpoints;

public static class ChecklistEndpoints
{
    public static IEndpointRouteBuilder MapChecklistEndpoints(this IEndpointRouteBuilder app)
    {
        var tasks = app.MapGroup("/api/parties/{partyId:guid}/tasks");

        tasks.MapGet("/", (Guid partyId, ISender sender, CancellationToken cancel) =>
            sender.Send(new GetChecklistQuery(partyId), cancel));

        tasks.MapPost("/", async (Guid partyId, TaskRequest request, ISender sender, CancellationToken cancel) =>
        {
            var task = await sender.Send(new SaveTaskCommand(partyId, null, request.Title ?? string.Empty, request.Due ?? string.Empty, request.OwnerId, request.RemindMe), cancel);
            return Results.Created($"/api/parties/{partyId}/tasks/{task.Id}", task);
        });

        tasks.MapPut("/{taskId:guid}", (Guid partyId, Guid taskId, TaskRequest request, ISender sender, CancellationToken cancel) =>
            sender.Send(new SaveTaskCommand(partyId, taskId, request.Title ?? string.Empty, request.Due ?? string.Empty, request.OwnerId, request.RemindMe), cancel));

        tasks.MapDelete("/{taskId:guid}", async (Guid partyId, Guid taskId, ISender sender, CancellationToken cancel) =>
        {
            await sender.Send(new DeleteTaskCommand(partyId, taskId), cancel);
            return Results.NoContent();
        });

        // A change made offline sends the version it saw as If-Match; 412 means someone changed it since.
        tasks.MapPut("/{taskId:guid}/done", (Guid partyId, Guid taskId, TaskDoneRequest request, HttpRequest http, ISender sender, CancellationToken cancel) =>
            sender.Send(new SetTaskDoneCommand(partyId, taskId, request.Done, IfMatch(http)), cancel));

        tasks.MapPost("/{taskId:guid}/giddy", (Guid partyId, Guid taskId, ISender sender, CancellationToken cancel) =>
            sender.Send(new LetGiddyDoTaskCommand(partyId, taskId), cancel));

        tasks.MapPost("/generate", (Guid partyId, ISender sender, CancellationToken cancel) =>
            sender.Send(new MakeChecklistCommand(partyId), cancel));

        return app;
    }

    private static string? IfMatch(HttpRequest http) =>
        http.Headers.IfMatch.FirstOrDefault()?.Trim().Trim('"') is { Length: > 0 } version ? version : null;
}
