using FluentValidation;
using FluentValidation.Results;
using Giddy.Application.Common;
using MediatR;
using Microsoft.EntityFrameworkCore;
using NodaTime.Text;

namespace Giddy.Application.Invitations.SaveInvitation;

public sealed class SaveInvitationHandler(IGiddyDbContext db, InvitationReader reader) : IRequestHandler<SaveInvitationCommand, InvitationView>
{
    public async Task<InvitationView> Handle(SaveInvitationCommand request, CancellationToken cancellationToken)
    {
        var party = await db.Parties.SingleAsync(p => p.Id == request.PartyId, cancellationToken);
        var rsvpBy = LocalDatePattern.Iso.Parse(request.RsvpBy).Value;
        if (rsvpBy >= party.Date)
        {
            throw new ValidationException([new ValidationFailure(nameof(request.RsvpBy), "Choose an RSVP-by date before the party.")]);
        }

        var invitation = await reader.LoadOrDraftAsync(party, cancellationToken);
        if (db.Invitations.Entry(invitation).State == EntityState.Detached)
        {
            db.Invitations.Add(invitation);
        }

        invitation.Edit(request.Design, request.Headline, request.Message, rsvpBy, request.AskAllergies, request.AskParentStaying, request.AskSiblings, request.ByEmail, request.ByText);
        await db.SaveChangesAsync(cancellationToken);
        return await reader.ViewAsync(party, invitation, cancellationToken);
    }
}
