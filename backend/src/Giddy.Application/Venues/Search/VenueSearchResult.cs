namespace Giddy.Application.Venues.Search;

/// <param name="OutsideServiceArea">The area is outside the GTA, which is all Giddy covers for now.</param>
public sealed record VenueSearchResult(
    string? Area,
    int RadiusKm,
    bool OutsideServiceArea,
    IReadOnlyList<VenueResult> Results,
    NoResultsHint? NoResults);
