using Giddy.Application.Common;
using Giddy.Application.Guests.GetGuests;
using Giddy.Application.Invitations;
using Giddy.Domain.Guests;
using MediatR;
using Microsoft.EntityFrameworkCore;
using NodaTime;

namespace Giddy.Application.Guests.AddGuest;

/// <summary>Adds a family to the list, up to 60, never twice, and invites them now if asked.</summary>
public sealed class AddGuestHandler(IGiddyDbContext db, InvitationReader reader, InvitationDelivery delivery, IClock clock)
    : IRequestHandler<AddGuestCommand, GuestView>
{
    public const int MaximumGuests = 60;

    public async Task<GuestView> Handle(AddGuestCommand request, CancellationToken cancellationToken)
    {
        var existing = await db.Guests.Where(g => g.PartyId == request.PartyId).ToListAsync(cancellationToken);
        if (existing.Count >= MaximumGuests)
        {
            throw new ConflictException($"The guest list holds up to {MaximumGuests} guests.");
        }

        var duplicate = existing.FirstOrDefault(g =>
            string.Equals(g.ChildName, request.ChildName.Trim(), StringComparison.CurrentCultureIgnoreCase)
            && string.Equals(g.Email, request.Email.Trim(), StringComparison.OrdinalIgnoreCase));
        if (duplicate is not null)
        {
            throw new ConflictException($"{duplicate.ChildName} is already on the list.");
        }

        var guest = new Guest(Guid.NewGuid(), request.PartyId, request.ChildName, request.ParentName, request.Email, request.Mobile);
        db.Guests.Add(guest);
        var invitation = await db.Invitations.SingleOrDefaultAsync(i => i.PartyId == request.PartyId, cancellationToken);
        if (request.SendNow && invitation?.SentAt is not null)
        {
            var party = await db.Parties.SingleAsync(p => p.Id == request.PartyId, cancellationToken);
            await delivery.DeliverAsync(guest, invitation, await reader.DetailsAsync(party, cancellationToken), clock.GetCurrentInstant(), cancellationToken);
        }

        await db.SaveChangesAsync(cancellationToken);
        return GuestViews.From(guest, planner: true);
    }
}
