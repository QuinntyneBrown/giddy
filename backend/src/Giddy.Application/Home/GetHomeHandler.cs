using Giddy.Application.Common;
using Giddy.Application.Parties;
using Giddy.Application.Parties.GetPartyOverview;
using Giddy.Domain.Calendar;
using Giddy.Domain.Home;
using Giddy.Domain.Parties;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Giddy.Application.Home;

public sealed class GetHomeHandler(IGiddyDbContext db, ICurrentParent parent, TorontoCalendar calendar) : IRequestHandler<GetHomeQuery, HomeView>
{
    public async Task<HomeView> Handle(GetHomeQuery request, CancellationToken cancellationToken)
    {
        var today = calendar.Today;
        var parties = await MyParties.LoadAsync(db, parent.Id, cancellationToken);
        var upcoming = parties.Where(p => !p.IsLockedOn(today)).OrderBy(p => p.Date).ThenBy(p => p.StartsAt).ToList();
        var next = upcoming.FirstOrDefault();
        var family = await db.Families.SingleOrDefaultAsync(f => f.Id == parent.Id, cancellationToken);
        var planned = upcoming.Where(p => p.ChildId is not null).Select(p => p.ChildId!.Value).ToHashSet();
        var birthday = family?.Children
            .Where(c => !planned.Contains(c.Id) && calendar.DaysUntil(c.NextBirthday(today)) <= 120)
            .OrderBy(c => c.NextBirthday(today))
            .Select(c => new UpcomingBirthday(
                c.Id,
                c.FirstName,
                c.TurningAge(today),
                PartySummaryMapper.DatePattern.Format(c.NextBirthday(today)),
                calendar.DaysUntil(c.NextBirthday(today))))
            .FirstOrDefault();

        return new HomeView(
            upcoming.Count,
            NudgeEngine.NeedingAttention(upcoming, today),
            next is null ? null : new HomeParty(
                next.Id,
                next.Name,
                PartySummaryMapper.DatePattern.Format(next.Date),
                PartySummaryMapper.TimePattern.Format(next.StartsAt),
                PartySummaryMapper.TimePattern.Format(next.EndsAt),
                calendar.DaysUntil(next.Date),
                PartySummaryMapper.VenueOf(next),
                next.GuestCount,
                Readiness.Of(next),
                next.Checklist.Count(t => t.Done) + next.BookingsToDo.Count(b => b.Status == BookingStatus.Confirmed),
                next.Checklist.Count + next.BookingsToDo.Count,
                NextStep.Of(next)),
            new RsvpCounts(0, 0, 0),
            next?.Allergies.Length ?? 0,
            birthday);
    }
}
