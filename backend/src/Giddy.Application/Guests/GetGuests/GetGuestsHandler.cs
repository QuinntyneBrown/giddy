using Giddy.Application.Common;
using Giddy.Domain.Guests;
using Giddy.Domain.Parties;
using MediatR;
using Microsoft.EntityFrameworkCore;
using NodaTime.Text;

namespace Giddy.Application.Guests.GetGuests;

public sealed class GetGuestsHandler(IGiddyDbContext db, ICurrentParent parent) : IRequestHandler<GetGuestsQuery, GuestListView>
{
    public async Task<GuestListView> Handle(GetGuestsQuery request, CancellationToken cancellationToken)
    {
        var party = await db.Parties.SingleAsync(p => p.Id == request.PartyId, cancellationToken);
        var planner = party.RoleOf(parent.Id)!.Value.CanPlan();
        var guests = await db.Guests.Where(g => g.PartyId == request.PartyId).ToListAsync(cancellationToken);
        guests = guests.OrderBy(g => g.ChildName, StringComparer.CurrentCultureIgnoreCase).ToList();

        return new GuestListView(
            guests.Select(g => new GuestView(
                g.Id,
                g.ChildName,
                g.ParentName,
                g.Rsvp,
                g.Allergies,
                g.ParentStaying,
                g.Note,
                planner ? g.Email : null,
                planner ? g.Mobile : null,
                g.Email is not null,
                g.Mobile is not null,
                g.EmailBounced,
                g.LastRemindedAt is { } reminded ? InstantPattern.General.Format(reminded) : null)).ToList(),
            new GuestCounts(
                guests.Count,
                guests.Count(g => g.Rsvp == RsvpStatus.Coming),
                guests.Count(g => g.Rsvp == RsvpStatus.Waiting),
                guests.Count(g => g.Rsvp == RsvpStatus.CantCome),
                guests.Count(g => g.Rsvp == RsvpStatus.NotSent)),
            AllergyLists.For(guests));
    }
}
