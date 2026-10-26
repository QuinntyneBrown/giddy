using Giddy.Application.Common;
using Giddy.Application.Conversations.Views;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Giddy.Application.Conversations.GetTurn;

public sealed class GetTurnHandler(IGiddyDbContext db, ConversationAccess access) : IRequestHandler<GetTurnQuery, TurnView>
{
    public async Task<TurnView> Handle(GetTurnQuery request, CancellationToken cancellationToken)
    {
        await access.LoadAsync(request.ConversationId, cancellationToken);
        var turn = await db.AgentTurns.AsNoTracking()
            .SingleOrDefaultAsync(t => t.Id == request.TurnId && t.ConversationId == request.ConversationId, cancellationToken)
            ?? throw new NotFoundException("Turn not found.");
        return new TurnView(turn.Id, turn.Status.ToString().ToLowerInvariant(), turn.Events.Where(e => e.Sequence > request.After).ToList());
    }
}
