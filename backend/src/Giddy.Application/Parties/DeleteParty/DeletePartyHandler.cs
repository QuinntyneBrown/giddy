using Giddy.Application.Common;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Giddy.Application.Parties.DeleteParty;

/// <summary>
/// Deletes the party for every planner, with its plans and chats. Bookings with venues and
/// vendors are not cancelled; guests are not notified.
/// </summary>
public sealed class DeletePartyHandler(IGiddyDbContext db) : IRequestHandler<DeletePartyCommand>
{
    public async Task Handle(DeletePartyCommand request, CancellationToken cancellationToken)
    {
        var party = await db.Parties.SingleAsync(p => p.Id == request.PartyId, cancellationToken);
        var conversations = await db.Conversations.Where(c => c.PartyId == party.Id).ToListAsync(cancellationToken);
        var conversationIds = conversations.Select(c => c.Id).ToList();
        db.AgentTurns.RemoveRange(await db.AgentTurns.Where(t => conversationIds.Contains(t.ConversationId)).ToListAsync(cancellationToken));
        db.Proposals.RemoveRange(await db.Proposals.Where(p => p.PartyId == party.Id).ToListAsync(cancellationToken));
        db.Conversations.RemoveRange(conversations);
        db.Guests.RemoveRange(await db.Guests.Where(g => g.PartyId == party.Id).ToListAsync(cancellationToken));
        db.Invitations.RemoveRange(await db.Invitations.Where(i => i.PartyId == party.Id).ToListAsync(cancellationToken));
        db.PartyEvents.RemoveRange(await db.PartyEvents.Where(e => e.PartyId == party.Id).ToListAsync(cancellationToken));
        db.Parties.Remove(party);
        await db.SaveChangesAsync(cancellationToken);
    }
}
