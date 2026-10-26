using Giddy.Application.Agent;
using Giddy.Application.Common;
using Giddy.Application.Conversations.Views;
using Giddy.Domain.Conversations;
using Giddy.Domain.Parties;
using Giddy.Domain.Proposals;
using Microsoft.EntityFrameworkCore;
using NodaTime.Text;

namespace Giddy.Application.Conversations;

public sealed class ConversationViewBuilder(IGiddyDbContext db)
{
    public async Task<ConversationView> BuildAsync(Conversation conversation, CancellationToken cancellationToken)
    {
        var party = conversation.PartyId is { } partyId
            ? await db.Parties.SingleOrDefaultAsync(p => p.Id == partyId, cancellationToken)
            : null;
        var proposalIds = conversation.Messages.Where(m => m.ProposalId is not null).Select(m => m.ProposalId!.Value).ToList();
        var proposals = await db.Proposals.Where(p => proposalIds.Contains(p.Id)).ToDictionaryAsync(p => p.Id, cancellationToken);
        var memories = await db.Memories.Where(m => m.FamilyId == conversation.ParentId)
            .OrderBy(m => m.RememberedAt)
            .Select(m => new MemoryView(m.Id, m.Text))
            .ToListAsync(cancellationToken);
        var running = await db.AgentTurns
            .Where(t => t.ConversationId == conversation.Id && t.Status == TurnStatus.Running)
            .Select(t => (Guid?)t.Id)
            .FirstOrDefaultAsync(cancellationToken);

        return new ConversationView(
            conversation.Id,
            party is null ? null : Glance(party),
            conversation.Messages.Select(m => new MessageView(
                m.Id,
                m.Author == MessageAuthor.Parent ? "parent" : "giddy",
                m.Text,
                InstantPattern.ExtendedIso.Format(m.SentAt),
                m.Steps,
                m.Suggestions,
                m.ProposalId is { } id && proposals.TryGetValue(id, out var proposal) ? View(proposal) : null)).ToList(),
            memories,
            running);
    }

    public static PartyAtAGlance Glance(Party party) => new(
        party.Id,
        party.Name,
        party.ChildName,
        party.TurningAge,
        party.ChildName is null ? null : $"{party.ChildName}, turning {party.TurningAge}",
        LocalDatePattern.Iso.Format(party.Date),
        TimeOfDay.Of(party.StartsAt),
        party.Area?.Name,
        party.Area?.SearchRadiusKm,
        party.GuestCount,
        party.Budget);

    public static ProposalView View(Proposal proposal) => new(
        proposal.Id,
        proposal.Title,
        new ThemeView(proposal.ThemeName, proposal.ThemeDetail),
        proposal.Items,
        proposal.Total,
        proposal.Budget,
        proposal.OverBudgetBy,
        proposal.AppliedAt is not null);
}
