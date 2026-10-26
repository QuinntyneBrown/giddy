using Giddy.Application.Agent;
using Giddy.Application.Common;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Giddy.Application.Conversations.CancelTurn;

/// <summary>Stops Giddy. A running turn stops within a second; a queued one never starts.</summary>
public sealed class CancelTurnHandler(IGiddyDbContext db, ConversationAccess access, TurnCancellations cancellations)
    : IRequestHandler<CancelTurnCommand>
{
    public async Task Handle(CancelTurnCommand request, CancellationToken cancellationToken)
    {
        await access.LoadAsync(request.ConversationId, cancellationToken);
        var turn = await db.AgentTurns.SingleOrDefaultAsync(t => t.Id == request.TurnId && t.ConversationId == request.ConversationId, cancellationToken)
            ?? throw new NotFoundException("Turn not found.");

        if (!cancellations.Cancel(turn.Id))
        {
            turn.Cancel();
            await db.SaveChangesAsync(cancellationToken);
        }
    }
}
