using Giddy.Application.Common;
using Giddy.Application.Live;
using Giddy.Domain.Guests;
using Microsoft.EntityFrameworkCore;
using MediatR;
using NodaTime;

namespace Giddy.Application.Rsvps.SubmitRsvp;

/// <summary>Records the family's reply, replacing any earlier one, and adds a new allergy to the party's list.</summary>
public sealed class SubmitRsvpHandler(Notifications.PlannerNews news, IGiddyDbContext db, RsvpLinks links, IClock clock) : IRequestHandler<SubmitRsvpCommand, RsvpView>
{
    public async Task<RsvpView> Handle(SubmitRsvpCommand request, CancellationToken cancellationToken)
    {
        var context = await links.ResolveAsync(request.Token, cancellationToken);
        if (!links.CanChange(context))
        {
            throw new ConflictException("The RSVP-by date has passed, so replies are closed. Contact the family directly.");
        }

        var (guest, party, _) = context;
        var now = clock.GetCurrentInstant();
        var replied = guest.RepliedAt is not null;
        var earlierAllergies = guest.Rsvp == RsvpStatus.Coming ? guest.Allergies : null;
        guest.Reply(request.Coming, request.Allergies, request.ParentStaying, request.Siblings, request.ParentName, request.Mobile, request.Note, now);
        news.TellPlanners(
            party,
            "💌",
            replied
                ? $"{guest.ParentName} changed their reply: {guest.ChildFirstName} {(request.Coming ? "is coming" : "can’t come")}"
                : $"{guest.ParentName} replied: {guest.ChildFirstName} {(request.Coming ? "is coming!" : "can’t come")}",
            request.Coming && !string.IsNullOrWhiteSpace(request.Allergies) ? $"{guest.ChildFirstName}: {request.Allergies!.Trim()}." : $"For {party.Name}.",
            $"/parties/{party.Id}/guests");
        if (replied)
        {
            db.PartyEvents.Add(PartyEvents.Changed(guest, now));
        }
        else
        {
            var othersComing = await db.Guests.CountAsync(g => g.PartyId == party.Id && g.Id != guest.Id && g.Rsvp == RsvpStatus.Coming, cancellationToken);
            db.PartyEvents.Add(PartyEvents.Replied(guest, othersComing + (request.Coming ? 1 : 0), now));
        }

        if (request.Coming && guest.Allergies is { } allergy)
        {
            party.NoteAllergy(allergy);
            if (!string.Equals(allergy, earlierAllergies, StringComparison.OrdinalIgnoreCase))
            {
                db.PartyEvents.Add(PartyEvents.NewAllergy(guest, party, now));
                party.AllergyArrivedAfterSharing(guest.ChildFirstName);
            }
        }

        await db.SaveChangesAsync(cancellationToken);
        return await links.ViewAsync(context, cancellationToken);
    }
}
