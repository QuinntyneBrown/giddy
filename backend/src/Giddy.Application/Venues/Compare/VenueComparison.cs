namespace Giddy.Application.Venues.Compare;

public sealed record VenueComparison(string Date, IReadOnlyList<ComparedVenue> Venues, IReadOnlyList<CompareRow> Rows, Recommendation Recommendation);
