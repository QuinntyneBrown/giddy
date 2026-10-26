using Giddy.Domain.Parties;
using MediatR;
using NodaTime.Text;

namespace Giddy.Application.Venues.Search;

public sealed class SearchVenuesHandler(VenueOrigins origins, VenueCandidates candidates) : IRequestHandler<SearchVenuesQuery, VenueSearchResult>
{
    public async Task<VenueSearchResult> Handle(SearchVenuesQuery request, CancellationToken cancellationToken)
    {
        var origin = await origins.ResolveAsync(request.PartyId, request.PostalCode, cancellationToken);
        if (origin is null || !origin.InServiceArea)
        {
            return new VenueSearchResult(origin?.Area.Name, request.RadiusKm, true, [], null);
        }

        var date = LocalDatePattern.Iso.Parse(request.Date).Value;
        var all = await candidates.FindAsync(origin.Area, date, request.Guests, Math.Max(request.RadiusKm, RelaxationAdvisor.WiderRadiusKm), cancellationToken);
        var filter = new VenueFilter(request.RadiusKm, request.MaxPrice, request.Indoor, request.NutFree, request.Parking, request.StepFree);
        var matches = all.Where(filter.Matches).ToList();
        var results = Sort(matches, request.Sort).Select(c => ToResult(c, request.Guests)).ToList();

        return new VenueSearchResult(
            origin.Area.Name,
            request.RadiusKm,
            false,
            results,
            results.Count == 0 ? RelaxationAdvisor.Advise(filter, all) : null);
    }

    private static IEnumerable<VenueCandidate> Sort(IEnumerable<VenueCandidate> candidates, string sort) => sort switch
    {
        VenueSort.Closest => candidates.OrderBy(c => c.DistanceKm),
        VenueSort.Price => candidates.OrderBy(c => c.Venue.Price).ThenBy(c => c.DistanceKm),
        VenueSort.Rating => candidates.OrderByDescending(c => c.Venue.Venue!.Rating).ThenByDescending(c => c.Venue.Venue!.ReviewCount),
        _ => candidates.OrderByDescending(BestMatch),
    };

    /// <summary>Rating counts most, then closeness and price; a close fit is pushed down.</summary>
    private static double BestMatch(VenueCandidate candidate) =>
        ((double)candidate.Venue.Venue!.Rating * 2)
        - (candidate.DistanceKm * 0.3)
        - ((double)candidate.Venue.Price / 200);

    public static VenueResult ToResult(VenueCandidate candidate, int guests)
    {
        var venue = candidate.Venue;
        var profile = venue.Venue!;
        var capacity = venue.Capacity ?? guests;
        return new VenueResult(
            venue.Id,
            venue.Name,
            profile.Emoji,
            venue.Neighbourhood,
            candidate.DistanceKm,
            capacity,
            profile.MinAge,
            profile.MaxAge,
            profile.Rating,
            profile.ReviewCount,
            VenueFeatures.Display(venue),
            venue.Price,
            profile.DurationMinutes,
            candidate.FreeSlots.Select(Slot).ToList(),
            capacity < guests ? $"Fits {capacity}; you invited {guests}" : null);
    }

    public static SlotView Slot(Domain.Catalogue.VenueSlot slot) => new(
        Parties.PartySummaryMapper.TimePattern.Format(slot.Start),
        Parties.PartySummaryMapper.TimePattern.Format(slot.End));
}
