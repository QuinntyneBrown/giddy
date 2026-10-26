using Giddy.Application.Common;
using Giddy.Application.Conversations.Views;
using Giddy.Domain.Calendar;
using Giddy.Domain.Conversations;
using Giddy.Domain.Parties;
using MediatR;
using Microsoft.EntityFrameworkCore;
using NodaTime;

namespace Giddy.Application.Conversations.OpenConversation;

public sealed class OpenConversationHandler(
    IGiddyDbContext db,
    ICurrentParent parent,
    TorontoCalendar calendar,
    IClock clock,
    ConversationViewBuilder views)
    : IRequestHandler<OpenConversationCommand, ConversationView>
{
    public async Task<ConversationView> Handle(OpenConversationCommand request, CancellationToken cancellationToken)
    {
        var conversations = await db.Conversations.Where(c => c.ParentId == parent.Id).ToListAsync(cancellationToken);
        var visible = new List<Conversation>();
        foreach (var candidate in conversations.OrderByDescending(c => c.StartedAt))
        {
            if (candidate.PartyId is not { } partyId
                || await db.Parties.AnyAsync(p => p.Id == partyId && p.Members.Any(m => m.ParentId == parent.Id), cancellationToken))
            {
                visible.Add(candidate);
            }
        }

        var conversation = visible.FirstOrDefault();
        if (conversation is null)
        {
            conversation = new Conversation(Guid.NewGuid(), parent.Id, await NextPartyIdAsync(db, parent.Id, calendar.Today, cancellationToken), clock.GetCurrentInstant());
            db.Conversations.Add(conversation);
            await db.SaveChangesAsync(cancellationToken);
        }

        return await views.BuildAsync(conversation, cancellationToken);
    }

    /// <summary>The soonest upcoming party the parent can plan.</summary>
    public static async Task<Guid?> NextPartyIdAsync(IGiddyDbContext db, Guid parentId, LocalDate today, CancellationToken cancellationToken)
    {
        var parties = await db.Parties
            .Where(p => p.Members.Any(m => m.ParentId == parentId && m.Role != PartyRole.Viewer))
            .ToListAsync(cancellationToken);
        return parties.Where(p => p.Date >= today).OrderBy(p => p.Date).Select(p => (Guid?)p.Id).FirstOrDefault();
    }
}
