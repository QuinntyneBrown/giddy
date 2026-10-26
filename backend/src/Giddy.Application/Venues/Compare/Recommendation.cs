namespace Giddy.Application.Venues.Compare;

/// <summary>Giddy's pick and why.</summary>
public sealed record Recommendation(Guid VenueId, string Name, string Reason);
