using Giddy.Application.Common;
using Giddy.Application.Parties;
using Giddy.Domain.Guests;
using Giddy.Domain.Invitations;
using Giddy.Domain.Parties;
using Microsoft.EntityFrameworkCore;
using NodaTime.Text;

namespace Giddy.Application.Invitations;

/// <summary>Loads a party's invitation, drafting one from the party when none is saved yet.</summary>
public sealed class InvitationReader(IGiddyDbContext db)
{
    public async Task<Invitation> LoadOrDraftAsync(Party party, CancellationToken cancellationToken) =>
        await db.Invitations.SingleOrDefaultAsync(i => i.PartyId == party.Id, cancellationToken) ?? Draft(party);

    public async Task<InvitationView> ViewAsync(Party party, Invitation invitation, CancellationToken cancellationToken)
    {
        var guests = await db.Guests.Where(g => g.PartyId == party.Id).ToListAsync(cancellationToken);
        return new InvitationView(
            invitation.Design,
            invitation.Headline,
            invitation.Message,
            PartySummaryMapper.DatePattern.Format(invitation.RsvpBy),
            invitation.AskAllergies,
            invitation.AskParentStaying,
            invitation.AskSiblings,
            invitation.ByEmail,
            invitation.ByText,
            guests.Count,
            guests.Count(g => g.Email is not null),
            guests.Count(g => g.Mobile is not null),
            guests.Count(g => g.Rsvp == RsvpStatus.NotSent),
            await DetailsAsync(party, cancellationToken),
            invitation.SentAt is { } sent ? InstantPattern.General.Format(sent) : null,
            PartySummaryMapper.DatePattern.Format(invitation.AutomaticReminderOn));
    }

    public async Task<InvitationDetails> DetailsAsync(Party party, CancellationToken cancellationToken)
    {
        var owner = party.Members.Single(m => m.Role == PartyRole.Owner).ParentId;
        var host = await db.Parents.Where(p => p.Id == owner).Select(p => p.Name).SingleOrDefaultAsync(cancellationToken) ?? "The host";
        return new InvitationDetails(
            party.ChildName ?? party.Name,
            PartySummaryMapper.DatePattern.Format(party.Date),
            PartySummaryMapper.TimePattern.Format(party.StartsAt),
            PartySummaryMapper.TimePattern.Format(party.EndsAt),
            await PlaceAsync(party, cancellationToken),
            host);
    }

    private async Task<string?> PlaceAsync(Party party, CancellationToken cancellationToken)
    {
        var venue = party.BookingsToDo.FirstOrDefault(b => b.Category == "Venue");
        if (venue is null)
        {
            return party.Area?.Name;
        }

        var address = await db.CatalogueItems
            .Where(i => i.Id == venue.CatalogueItemId || i.Name == venue.Name)
            .Select(i => i.Venue!.Address)
            .FirstOrDefaultAsync(cancellationToken);
        return string.IsNullOrEmpty(address) ? venue.Name : $"{venue.Name}, {address}";
    }

    private static Invitation Draft(Party party)
    {
        var child = party.ChildName ?? "The birthday child";
        var headline = party.TurningAge is { } age ? $"{child} is turning {age}!" : $"Join {child}’s party!";
        var theme = party.Theme is null ? "birthday party" : $"{party.Theme} party";
        var message = $"Come celebrate with {child} at a {theme}! There will be games, cake and plenty of fun. Wear clothes that can get messy!";
        return new Invitation(party.Id, InvitationDesigns.For(party.Theme), headline, message, party.Date.PlusDays(-8));
    }
}
