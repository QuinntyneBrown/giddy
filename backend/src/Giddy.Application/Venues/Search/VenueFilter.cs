namespace Giddy.Application.Venues.Search;

/// <summary>The parent's filters, which the relaxation advisor loosens one at a time.</summary>
public sealed record VenueFilter(int RadiusKm, decimal? MaxPrice, bool Indoor, bool NutFree, bool Parking, bool StepFree)
{
    public bool Matches(VenueCandidate candidate)
    {
        var venue = candidate.Venue;
        return candidate.DistanceKm <= RadiusKm
            && (MaxPrice is null || venue.Price <= MaxPrice)
            && (!Indoor || venue.Venue!.Indoor)
            && (!NutFree || venue.HasFeature(VenueFeatures.NutFreeKitchen))
            && (!Parking || venue.HasFeature(VenueFeatures.Parking))
            && (!StepFree || venue.HasFeature(VenueFeatures.StepFree));
    }
}
