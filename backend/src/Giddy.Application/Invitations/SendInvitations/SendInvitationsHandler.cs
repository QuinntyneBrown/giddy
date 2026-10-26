using Giddy.Application.Common;
using Giddy.Application.Parties;
using Giddy.Domain.Guests;
using MediatR;
using Microsoft.EntityFrameworkCore;
using NodaTime;

namespace Giddy.Application.Invitations.SendInvitations;

/// <summary>
/// Sends the invitation to every family not yet invited: a private link by each chosen channel
/// they have details for. Needs the sender's email to be verified.
/// </summary>
public sealed class SendInvitationsHandler(
    IGiddyDbContext db, InvitationReader reader, IEmailSender email, ISmsSender sms, IWebLinks links, ISecretProtector protector, ICurrentParent parent, IClock clock)
    : IRequestHandler<SendInvitationsCommand, InvitationsSent>
{
    public async Task<InvitationsSent> Handle(SendInvitationsCommand request, CancellationToken cancellationToken)
    {
        if (!parent.EmailVerified)
        {
            throw new EmailUnverifiedException("Verify your email before sending invitations, so families know they come from you.");
        }

        var party = await db.Parties.SingleAsync(p => p.Id == request.PartyId, cancellationToken);
        var invitation = await reader.LoadOrDraftAsync(party, cancellationToken);
        if (db.Invitations.Entry(invitation).State == EntityState.Detached)
        {
            db.Invitations.Add(invitation);
        }

        var details = await reader.DetailsAsync(party, cancellationToken);
        var guests = await db.Guests.Where(g => g.PartyId == party.Id && g.Rsvp == RsvpStatus.NotSent).ToListAsync(cancellationToken);
        var now = clock.GetCurrentInstant();
        foreach (var guest in guests)
        {
            var token = RsvpTokens.Create();
            guest.Invite(RsvpTokens.Hash(token), protector.Protect(token), now);
            var link = links.To($"/rsvp/{token}");
            if (invitation.ByEmail && guest.Email is { } address)
            {
                await email.SendAsync(InvitationMessages.Email(address, invitation, details, link, guest.Id.ToString()), cancellationToken);
            }

            if (invitation.ByText && guest.Mobile is { } mobile)
            {
                await sms.SendAsync(InvitationMessages.Text(mobile, invitation, details, link), cancellationToken);
            }
        }

        invitation.MarkSent(now);
        await db.SaveChangesAsync(cancellationToken);
        return new InvitationsSent(guests.Count, PartySummaryMapper.DatePattern.Format(invitation.AutomaticReminderOn));
    }
}
