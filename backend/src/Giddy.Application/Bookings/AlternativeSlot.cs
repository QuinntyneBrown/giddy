namespace Giddy.Application.Bookings;

/// <summary>A free slot at the same venue on the same day.</summary>
public sealed record AlternativeSlot(Guid VenueId, string VenueName, string Start, string End);
