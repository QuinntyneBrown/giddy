using Giddy.Application.Common;
using Giddy.Domain.Conversations;
using Microsoft.EntityFrameworkCore;

namespace Giddy.Application.Conversations;

/// <summary>
/// Conversations are private to the parent who started them, and only while that parent can
/// still see the party. Anyone else is told the conversation does not exist.
/// </summary>
public sealed class ConversationAccess(IGiddyDbContext db, ICurrentParent parent)
{
    public async Task<Conversation> LoadAsync(Guid conversationId, CancellationToken cancellationToken)
    {
        var conversation = await db.Conversations.SingleOrDefaultAsync(
            c => c.Id == conversationId && c.ParentId == parent.Id, cancellationToken)
            ?? throw new NotFoundException("Conversation not found.");

        if (conversation.PartyId is { } partyId
            && !await db.Parties.AnyAsync(p => p.Id == partyId && p.Members.Any(m => m.ParentId == parent.Id), cancellationToken))
        {
            throw new NotFoundException("Conversation not found.");
        }

        return conversation;
    }
}
