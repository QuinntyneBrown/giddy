using Giddy.Application.Common;
using Giddy.Application.Invitations;
using Giddy.Domain.Guests;
using MediatR;
using Microsoft.EntityFrameworkCore;
using NodaTime;

namespace Giddy.Application.Guests.SendReminders;

/// <summary>
/// Reminds the selected families who haven't replied, by every channel that works for them, at most
/// once every 48 hours.
/// </summary>
public sealed class SendRemindersHandler(
    IGiddyDbContext db, InvitationReader reader, IEmailSender email, ISmsSender sms, IWebLinks links, ISecretProtector protector, IClock clock)
    : IRequestHandler<SendRemindersCommand, RemindersSent>
{
    private static readonly Duration Cooldown = Duration.FromHours(48);

    public async Task<RemindersSent> Handle(SendRemindersCommand request, CancellationToken cancellationToken)
    {
        var guests = await db.Guests.Where(g => g.PartyId == request.PartyId && request.GuestIds.Contains(g.Id)).ToListAsync(cancellationToken);
        if (guests.Count != request.GuestIds.Distinct().Count())
        {
            throw new NotFoundException("Guest not found.");
        }

        var party = await db.Parties.SingleAsync(p => p.Id == request.PartyId, cancellationToken);
        var invitation = await reader.LoadOrDraftAsync(party, cancellationToken);
        var details = await reader.DetailsAsync(party, cancellationToken);
        var now = clock.GetCurrentInstant();
        var reminded = new List<string>();
        var skipped = new List<ReminderOutcome>();
        var undeliverable = new List<ReminderOutcome>();

        foreach (var guest in guests.OrderBy(g => g.ChildName))
        {
            var reason = guest.Rsvp switch
            {
                RsvpStatus.Coming or RsvpStatus.CantCome => "Already replied",
                RsvpStatus.NotSent => "Not invited yet",
                _ when guest.LastRemindedAt is { } last && now - last < Cooldown => "Reminded less than 48 hours ago",
                _ => null,
            };
            if (reason is not null)
            {
                skipped.Add(new ReminderOutcome(guest.Id, guest.ChildFirstName, reason));
                continue;
            }

            var byEmail = guest.Email is not null && !guest.EmailBounced;
            if (!byEmail && guest.Mobile is null)
            {
                undeliverable.Add(new ReminderOutcome(
                    guest.Id, guest.ChildFirstName, guest.EmailBounced ? "The email bounced and there’s no mobile number" : "No email or mobile number"));
                continue;
            }

            var link = links.To($"/rsvp/{protector.Unprotect(guest.ProtectedToken!)}");
            if (byEmail)
            {
                await email.SendAsync(ReminderMessages.Email(guest.Email!, invitation, details, link, guest.Id.ToString()), cancellationToken);
            }

            if (guest.Mobile is { } mobile)
            {
                await sms.SendAsync(ReminderMessages.Text(mobile, invitation, details, link), cancellationToken);
            }

            guest.Remind(now);
            reminded.Add(guest.ChildFirstName);
        }

        await db.SaveChangesAsync(cancellationToken);
        return new RemindersSent(reminded, skipped, undeliverable);
    }
}
