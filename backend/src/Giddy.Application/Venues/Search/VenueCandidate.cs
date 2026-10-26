using Giddy.Domain.Catalogue;

namespace Giddy.Application.Venues.Search;

/// <summary>A venue free on the date that fits, before the parent's own filters are applied.</summary>
public sealed record VenueCandidate(CatalogueItem Venue, double DistanceKm, IReadOnlyList<VenueSlot> FreeSlots);
