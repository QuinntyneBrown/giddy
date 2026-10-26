using Giddy.Application.Agent;
using Giddy.Application.Common;
using Giddy.Domain.Calendar;
using Giddy.Domain.Parties;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Giddy.Application.Parties.GetPartyOverview;

public sealed class GetPartyOverviewHandler(IGiddyDbContext db, ICurrentParent parent, TorontoCalendar calendar)
    : IRequestHandler<GetPartyOverviewQuery, PartyOverview>
{
    public async Task<PartyOverview> Handle(GetPartyOverviewQuery request, CancellationToken cancellationToken)
    {
        var party = await db.Parties.SingleAsync(p => p.Id == request.PartyId, cancellationToken);
        var memberIds = party.Members.Select(m => m.ParentId).ToList();
        var names = await db.Parents.Where(p => memberIds.Contains(p.Id)).ToDictionaryAsync(p => p.Id, p => p.Name, cancellationToken);
        var today = calendar.Today;
        var role = party.RoleOf(parent.Id)!.Value;

        return new PartyOverview(
            party.Id,
            party.Name,
            PartySummaryMapper.DatePattern.Format(party.Date),
            PartySummaryMapper.TimePattern.Format(party.StartsAt),
            PartySummaryMapper.TimePattern.Format(party.EndsAt),
            TimeOfDay.Of(party.StartsAt),
            calendar.DaysUntil(party.Date),
            party.ChildName,
            party.TurningAge,
            party.Area?.Name,
            PartySummaryMapper.VenueOf(party),
            party.Theme,
            party.GuestCount,
            Readiness.Of(party),
            party.Checklist.Count(t => t.Done),
            party.Checklist.Count,
            party.Checklist.Where(t => !t.Done).OrderBy(t => t.Due).Take(3)
                .Select(t => new PartyTaskView(t.Title, PartySummaryMapper.DatePattern.Format(t.Due), t.Due < today)).ToList(),
            NextStep.Of(party),
            party.Allergies,
            party.Budget,
            party.Planned,
            new RsvpCounts(0, 0, 0),
            party.Members
                .OrderBy(m => m.Role)
                .Select(m => new PartyMemberView(m.ParentId, names.GetValueOrDefault(m.ParentId) ?? "A planner", m.Role, m.ParentId == parent.Id))
                .ToList(),
            role,
            role == PartyRole.Owner,
            party.IsLockedOn(today));
    }
}
