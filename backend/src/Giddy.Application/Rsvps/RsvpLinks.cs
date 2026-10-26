using Giddy.Application.Common;
using Giddy.Application.Invitations;
using Giddy.Domain.Calendar;
using Microsoft.EntityFrameworkCore;

namespace Giddy.Application.Rsvps;

/// <summary>Resolves a private link to its guest, party and invitation, and shapes what the guest may see.</summary>
public sealed class RsvpLinks(IGiddyDbContext db, InvitationReader reader, TorontoCalendar calendar)
{
    public async Task<RsvpContext> ResolveAsync(string token, CancellationToken cancellationToken)
    {
        var hash = RsvpTokens.Hash(token);
        var guest = await db.Guests.SingleOrDefaultAsync(g => g.TokenHash == hash, cancellationToken) ?? throw new RsvpLinkNotWorkingException();
        var party = await db.Parties.SingleOrDefaultAsync(p => p.Id == guest.PartyId, cancellationToken) ?? throw new RsvpLinkNotWorkingException();
        var invitation = await db.Invitations.SingleOrDefaultAsync(i => i.PartyId == party.Id, cancellationToken) ?? throw new RsvpLinkNotWorkingException();
        return new RsvpContext(guest, party, invitation);
    }

    public bool CanChange(RsvpContext context) => calendar.Today <= context.Invitation.RsvpBy;

    public async Task<RsvpView> ViewAsync(RsvpContext context, CancellationToken cancellationToken)
    {
        var (guest, party, invitation) = context;
        return new RsvpView(
            new RsvpInvitation(
                invitation.Design,
                invitation.Headline,
                invitation.Message,
                Parties.PartySummaryMapper.DatePattern.Format(invitation.RsvpBy),
                await reader.DetailsAsync(party, cancellationToken)),
            new RsvpGuest(guest.ChildFirstName, guest.FamilyName, guest.ParentName, guest.Rsvp, guest.Allergies, guest.ParentStaying, guest.Siblings, guest.Mobile, guest.Note),
            new RsvpQuestions(invitation.AskAllergies, invitation.AskParentStaying, invitation.AskSiblings),
            CanChange(context));
    }
}
