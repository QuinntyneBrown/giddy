using System.Globalization;
using Giddy.Application.Common;
using Giddy.Application.Venues.Search;
using Giddy.Domain.Catalogue;
using MediatR;
using Microsoft.EntityFrameworkCore;
using NodaTime.Text;

namespace Giddy.Application.Venues.Compare;

/// <summary>
/// Lines venues up side by side, marks the best value in each row and recommends the venue that is
/// best in the most rows (ties go to the cheaper venue).
/// </summary>
public sealed class CompareVenuesHandler(IGiddyDbContext db, VenueOrigins origins) : IRequestHandler<CompareVenuesQuery, VenueComparison>
{
    public async Task<VenueComparison> Handle(CompareVenuesQuery request, CancellationToken cancellationToken)
    {
        var ids = request.VenueIds.Distinct().ToList();
        var found = await db.CatalogueItems.Where(i => ids.Contains(i.Id) && i.Category == CatalogueCategory.Venue).ToListAsync(cancellationToken);
        if (found.Count != ids.Count || found.Any(v => v.Venue is null))
        {
            throw new NotFoundException("Venue not found.");
        }

        var venues = ids.Select(id => found.Single(v => v.Id == id)).ToList();
        var date = LocalDatePattern.Iso.Parse(request.Date).Value;
        var origin = await origins.ResolveAsync(request.PartyId, null, cancellationToken);
        var distances = venues.Select(v => origin is null ? (double?)null : Math.Round(Distance.Kilometres(origin.Area.Latitude, origin.Area.Longitude, v.Latitude, v.Longitude), 1)).ToList();
        var freeSlots = venues.Select(v => v.FreeSlotsOn(date).Select(SearchVenuesHandler.Slot).FirstOrDefault()).ToList();
        var theme = origin?.Party?.Theme;

        var rows = new List<CompareRow>
        {
            Row("Price", venues, v => (double)v.Price, lowerIsBetter: true, v => $"{Money(v.Price)} for {VenueFeatures.Duration(v.Venue!.DurationMinutes)}"),
            new("Free on the date", freeSlots.Select(s => new CompareCell(s is null ? "Fully booked" : $"From {s.Start}", false)).ToList()),
            Row("Fits", venues, v => v.Capacity ?? 0, lowerIsBetter: false, v => $"{v.Capacity} kids"),
            distances.All(d => d is not null)
                ? RowFromValues("Distance", distances.Select(d => d!.Value).ToList(), lowerIsBetter: true, d => $"{d:0.0} km")
                : new CompareRow("Distance", venues.Select(_ => new CompareCell("—", false)).ToList()),
            Row("Rating", venues, v => (double)v.Venue!.Rating, lowerIsBetter: false, v => $"{v.Venue!.Rating:0.0} ({v.Venue.ReviewCount})"),
            new("Nut-free kitchen", venues.Select(v => new CompareCell(v.HasFeature(VenueFeatures.NutFreeKitchen) ? "Yes" : "No", false)).ToList()),
            new("Party host", venues.Select(v => new CompareCell(v.Venue!.PartyHost ? "Included" : "Not included", false)).ToList()),
            new("Theme fit", venues.Select(v => new CompareCell(v.Venue!.ThemeFit ?? "—", theme is not null && v.Themes.Any(t => theme.Contains(t, StringComparison.OrdinalIgnoreCase)))).ToList()),
        };

        var scores = venues.Select((v, i) => (venue: v, wins: rows.Count(r => r.Cells[i].Best))).ToList();
        var pick = scores.OrderByDescending(s => s.wins).ThenBy(s => s.venue.Price).First().venue;
        var index = venues.IndexOf(pick);
        var reasons = rows.Where(r => r.Cells[index].Best).Select(r => Reason(r.Label)).ToList();
        var reason = reasons.Count == 0 ? "The best all-round fit." : Sentence(reasons);

        return new VenueComparison(
            request.Date,
            venues.Select((v, i) => new ComparedVenue(v.Id, v.Name, v.Venue!.Emoji, freeSlots[i]?.Start)).ToList(),
            rows,
            new Recommendation(pick.Id, pick.Name, reason));
    }

    private static CompareRow Row(string label, List<CatalogueItem> venues, Func<CatalogueItem, double> value, bool lowerIsBetter, Func<CatalogueItem, string> text)
    {
        var values = venues.Select(value).ToList();
        var best = lowerIsBetter ? values.Min() : values.Max();
        var unique = values.Count(v => v == best) == 1;
        return new CompareRow(label, venues.Select((v, i) => new CompareCell(text(v), unique && values[i] == best)).ToList());
    }

    private static CompareRow RowFromValues(string label, List<double> values, bool lowerIsBetter, Func<double, string> text)
    {
        var best = lowerIsBetter ? values.Min() : values.Max();
        var unique = values.Count(v => v == best) == 1;
        return new CompareRow(label, values.Select(v => new CompareCell(text(v), unique && v == best)).ToList());
    }

    /// <summary>"Cheapest and closest." or "Cheapest, closest and best rated."</summary>
    private static string Sentence(List<string> parts)
    {
        var text = parts.Count == 1 ? parts[0] : $"{string.Join(", ", parts[..^1])} and {parts[^1]}";
        return char.ToUpperInvariant(text[0]) + text[1..] + ".";
    }

    private static string Reason(string label) => label switch
    {
        "Price" => "cheapest",
        "Fits" => "the most room",
        "Distance" => "closest",
        "Rating" => "best rated",
        "Theme fit" => "fits the theme",
        _ => label.ToLowerInvariant(),
    };

    private static string Money(decimal amount) => "$" + amount.ToString("#,0", CultureInfo.InvariantCulture);
}
