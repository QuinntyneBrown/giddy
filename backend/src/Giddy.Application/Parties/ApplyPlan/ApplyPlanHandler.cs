using Giddy.Application.Common;
using Giddy.Domain.Calendar;
using Giddy.Domain.Conversations;
using Giddy.Domain.Parties;
using MediatR;
using Microsoft.EntityFrameworkCore;
using NodaTime;

namespace Giddy.Application.Parties.ApplyPlan;

/// <summary>
/// Applies a confirmed proposal to its party in one unit of work: theme, bookings to do with
/// estimates, and a dated checklist. Nothing is booked or paid.
/// </summary>
public sealed class ApplyPlanHandler(IGiddyDbContext db, TorontoCalendar calendar, IClock clock)
    : IRequestHandler<ApplyPlanCommand, PlanApplied>
{
    public async Task<PlanApplied> Handle(ApplyPlanCommand request, CancellationToken cancellationToken)
    {
        var proposal = await db.Proposals.SingleOrDefaultAsync(p => p.Id == request.ProposalId && p.PartyId == request.PartyId, cancellationToken)
            ?? throw new NotFoundException("Plan not found.");
        var party = await db.Parties.SingleAsync(p => p.Id == request.PartyId, cancellationToken);

        party.ApplyPlan(
            proposal.ThemeName,
            proposal.Items.Select(i => new BookingToDo(i.Category, i.Name, i.Price, i.CatalogueItemId)),
            ChecklistGenerator.For(party.Date, calendar.Today));
        proposal.MarkApplied(clock.GetCurrentInstant());

        var conversation = await db.Conversations.SingleOrDefaultAsync(c => c.Id == proposal.ConversationId, cancellationToken);
        conversation?.AddGiddyMessage(ChatMessage.FromGiddy(Guid.NewGuid(), $"Plan saved to {party.Name}", clock.GetCurrentInstant(), [], [], null));

        await db.SaveChangesAsync(cancellationToken);
        return new PlanApplied(party.Id, party.Name, proposal.ThemeName, party.BookingsToDo.Count, proposal.Total, party.Checklist.Count);
    }
}
