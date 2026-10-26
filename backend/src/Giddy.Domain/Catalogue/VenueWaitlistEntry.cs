using NodaTime;

namespace Giddy.Domain.Catalogue;

/// <summary>A family's request to hear when a slot opens at a venue on a date.</summary>
public sealed class VenueWaitlistEntry
{
    private VenueWaitlistEntry()
    {
    }

    public VenueWaitlistEntry(Guid id, Guid familyId, Guid venueId, LocalDate date, Guid? partyId, Instant requestedAt)
    {
        Id = id;
        FamilyId = familyId;
        VenueId = venueId;
        Date = date;
        PartyId = partyId;
        RequestedAt = requestedAt;
    }

    public Guid Id { get; private set; }

    public Guid FamilyId { get; private set; }

    public Guid VenueId { get; private set; }

    public LocalDate Date { get; private set; }

    public Guid? PartyId { get; private set; }

    public Instant RequestedAt { get; private set; }
}
