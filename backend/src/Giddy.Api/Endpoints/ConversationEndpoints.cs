using Giddy.Application.Conversations.CancelTurn;
using Giddy.Application.Conversations.GetTurn;
using Giddy.Application.Conversations.OpenConversation;
using Giddy.Application.Conversations.SendMessage;
using Giddy.Application.Conversations.StartConversation;
using MediatR;

namespace Giddy.Api.Endpoints;

public static class ConversationEndpoints
{
    public static IEndpointRouteBuilder MapConversationEndpoints(this IEndpointRouteBuilder app)
    {
        var conversations = app.MapGroup("/api/conversations");

        conversations.MapGet("/current", (ISender sender, CancellationToken cancel) => sender.Send(new OpenConversationCommand(), cancel));

        conversations.MapPost("/", (ISender sender, CancellationToken cancel) => sender.Send(new StartConversationCommand(), cancel));

        conversations.MapPost("/{conversationId:guid}/messages", async (Guid conversationId, SendMessageRequest request, ISender sender, CancellationToken cancel) =>
            Results.Accepted(value: await sender.Send(new SendMessageCommand(conversationId, request.Text ?? string.Empty), cancel)));

        conversations.MapGet("/{conversationId:guid}/turns/{turnId:guid}", (Guid conversationId, Guid turnId, int? after, ISender sender, CancellationToken cancel) =>
            sender.Send(new GetTurnQuery(conversationId, turnId, after ?? 0), cancel));

        conversations.MapPost("/{conversationId:guid}/turns/{turnId:guid}/cancel", async (Guid conversationId, Guid turnId, ISender sender, CancellationToken cancel) =>
        {
            await sender.Send(new CancelTurnCommand(conversationId, turnId), cancel);
            return Results.Accepted();
        });

        return app;
    }
}
