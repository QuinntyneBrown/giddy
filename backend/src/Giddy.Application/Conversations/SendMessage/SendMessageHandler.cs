using Giddy.Application.Agent;
using Giddy.Application.Common;
using Giddy.Application.Conversations.Views;
using Giddy.Domain.Conversations;
using MediatR;
using Microsoft.EntityFrameworkCore;
using NodaTime;

namespace Giddy.Application.Conversations.SendMessage;

/// <summary>Saves the parent's message and queues a turn for Giddy; the reply arrives as turn events.</summary>
public sealed class SendMessageHandler(
    IGiddyDbContext db,
    ICurrentParent parent,
    ConversationAccess access,
    IAgentTurnQueue queue,
    IClock clock)
    : IRequestHandler<SendMessageCommand, MessageAccepted>
{
    public async Task<MessageAccepted> Handle(SendMessageCommand request, CancellationToken cancellationToken)
    {
        var conversation = await access.LoadAsync(request.ConversationId, cancellationToken);
        if (await db.AgentTurns.AnyAsync(t => t.ConversationId == conversation.Id && t.Status == TurnStatus.Running, cancellationToken))
        {
            throw new FluentValidation.ValidationException([new FluentValidation.Results.ValidationFailure("text", "Giddy is still answering. Stop it or wait a moment.")]);
        }

        var now = clock.GetCurrentInstant();
        var message = conversation.AddParentMessage(Guid.NewGuid(), request.Text, now);
        var turn = new AgentTurn(Guid.NewGuid(), conversation.Id, message.Id, now);
        db.AgentTurns.Add(turn);
        await db.SaveChangesAsync(cancellationToken);
        await queue.EnqueueAsync(new TurnRequest(turn.Id, parent.Name), cancellationToken);
        return new MessageAccepted(message.Id, turn.Id);
    }
}
