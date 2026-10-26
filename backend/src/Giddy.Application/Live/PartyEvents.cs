using Giddy.Domain.Guests;
using Giddy.Domain.Live;
using Giddy.Domain.Parties;
using NodaTime;

namespace Giddy.Application.Live;

/// <summary>What the host is told about each thing a guest's family does.</summary>
public static class PartyEvents
{
    public static PartyEvent Opened(Guest guest, Instant now) => new(
        guest.PartyId, guest.Id, "opened", "info", $"{Capitalise(guest.FamilyName)} opened the invitation", "They haven’t replied yet.", null, null, now);

    public static PartyEvent Replied(Guest guest, int coming, Instant now) => guest.Rsvp == RsvpStatus.Coming
        ? new(guest.PartyId, guest.Id, "replied", "success", $"{guest.ChildFirstName} is coming!", $"{guest.ParentName} replied. {coming} coming so far.", "View guests", "view-guests", now)
        : new(guest.PartyId, guest.Id, "replied", "info", $"{guest.ChildFirstName} can’t come", $"{guest.ParentName} replied. {coming} coming so far.", "View guests", "view-guests", now);

    public static PartyEvent Changed(Guest guest, Instant now) => new(
        guest.PartyId,
        guest.Id,
        "changed",
        "info",
        $"{guest.ParentName} changed their reply",
        guest.Rsvp == RsvpStatus.Coming ? $"{guest.ChildFirstName} is coming now." : $"{guest.ChildFirstName} can’t come now.",
        "View guests",
        "view-guests",
        now);

    public static PartyEvent NewAllergy(Guest guest, Party party, Instant now)
    {
        var allergy = guest.Allergies!.ToLowerInvariant();
        var venue = party.BookingsToDo.FirstOrDefault(b => b.Category == "Venue" && b.Status == BookingStatus.Confirmed)?.Name;
        return new PartyEvent(
            guest.PartyId,
            guest.Id,
            "allergy",
            "warning",
            $"New allergy: {allergy}",
            $"{guest.ParentName} says {guest.ChildFirstName} has a {allergy} allergy." + (venue is null ? " Keep it in mind for the food and cake." : $" Let {venue} know."),
            venue is null ? null : $"Share with {venue}",
            venue is null ? null : "share-allergies",
            now);
    }

    public static PartyEvent Bounced(Guest guest, Instant now) => new(
        guest.PartyId, guest.Id, "bounced", "danger", $"The invitation to {guest.FamilyName} bounced", $"{guest.Email} didn’t accept it. Check the address with {guest.ParentName}.", "Fix email", "fix-email", now);

    private static string Capitalise(string text) => char.ToUpperInvariant(text[0]) + text[1..];
}
