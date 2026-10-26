using Giddy.Application.Common;
using Giddy.Domain.Guests;
using Giddy.Domain.Invitations;
using NodaTime;

namespace Giddy.Application.Invitations;

/// <summary>Gives one family its private link by each chosen channel they have details for.</summary>
public sealed class InvitationDelivery(IEmailSender email, Notifications.Texts texts, IWebLinks links, ISecretProtector protector)
{
    public async Task DeliverAsync(Guest guest, Invitation invitation, InvitationDetails details, Instant now, CancellationToken cancellationToken)
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
            var text = InvitationMessages.Text(mobile, invitation, details, link);
            await texts.SendAsync(text.To, text.Body, cancellationToken);
        }
    }
}
