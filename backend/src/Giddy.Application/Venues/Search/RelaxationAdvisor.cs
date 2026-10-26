using System.Globalization;

namespace Giddy.Application.Venues.Search;

/// <summary>When nothing matches, names the filters in the way and finds one change that brings results back.</summary>
public static class RelaxationAdvisor
{
    public const int WiderRadiusKm = 25;

    public static NoResultsHint Advise(VenueFilter filter, IReadOnlyList<VenueCandidate> candidates)
    {
        var conflicts = new List<string>();
        if (filter.MaxPrice is { } max) conflicts.Add($"under {Money(max)}");
        if (filter.NutFree) conflicts.Add("with a nut-free kitchen");
        if (filter.Parking) conflicts.Add("with parking");
        if (filter.StepFree) conflicts.Add("with step-free access");
        if (filter.Indoor) conflicts.Add("indoors");

        return new NoResultsHint(conflicts, Suggest(filter, candidates));
    }

    private static RelaxationSuggestion? Suggest(VenueFilter filter, IReadOnlyList<VenueCandidate> candidates)
    {
        if (filter.MaxPrice is not null)
        {
            var cheapest = candidates.Where(c => (filter with { MaxPrice = null }).Matches(c)).Select(c => c.Venue.Price).DefaultIfEmpty().Min();
            if (cheapest > 0)
            {
                var count = candidates.Count(c => (filter with { MaxPrice = cheapest }).Matches(c));
                return new RelaxationSuggestion($"Raise to {Money(cheapest)}", "maxPrice", cheapest.ToString("0", CultureInfo.InvariantCulture), count);
            }
        }

        var options = new (bool Active, VenueFilter Relaxed, string Label, string Filter)[]
        {
            (filter.NutFree, filter with { NutFree = false }, "Show venues without a nut-free kitchen", "nutFree"),
            (filter.Parking, filter with { Parking = false }, "Show venues without parking", "parking"),
            (filter.StepFree, filter with { StepFree = false }, "Show venues without step-free access", "stepFree"),
            (filter.Indoor, filter with { Indoor = false }, "Include outdoor venues", "indoor"),
        };
        foreach (var option in options.Where(o => o.Active))
        {
            var count = candidates.Count(option.Relaxed.Matches);
            if (count > 0) return new RelaxationSuggestion(option.Label, option.Filter, "false", count);
        }

        if (filter.RadiusKm < WiderRadiusKm)
        {
            var count = candidates.Count((filter with { RadiusKm = WiderRadiusKm }).Matches);
            if (count > 0) return new RelaxationSuggestion($"Look within {WiderRadiusKm} km", "radiusKm", WiderRadiusKm.ToString(CultureInfo.InvariantCulture), count);
        }

        return null;
    }

    private static string Money(decimal amount) => "$" + amount.ToString("#,0", CultureInfo.InvariantCulture);
}
