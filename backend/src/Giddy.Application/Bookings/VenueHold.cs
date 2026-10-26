using NodaTime;

namespace Giddy.Application.Bookings;

/// <summary>A slot the venue is keeping for the parent until it expires.</summary>
public sealed record VenueHold(string Reference, Instant ExpiresAt);
