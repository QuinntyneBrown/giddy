using Giddy.Application.Common;
using Giddy.Domain.Calendar;
using Giddy.Domain.Catalogue;
using Giddy.Domain.Guests;
using Giddy.Domain.Parties;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Giddy.Application.Vendors.Search;

/// <summary>
/// Vendors free on the party date who travel or deliver to the booked venue (or the party's area),
/// filtered by the party's theme and a price, and checked against every recorded allergy.
/// </summary>
public sealed class SearchVendorsHandler(IGiddyDbContext db) : IRequestHandler<SearchVendorsQuery, VendorSearchResult>
{
    private static readonly (string Label, string[] Allergens)[] DietaryOptions =
    [
        ("nut-free", ["peanut", "tree nut"]),
        ("gluten-free", ["gluten"]),
        ("dairy-free", ["dairy"]),
    ];

    public async Task<VendorSearchResult> Handle(SearchVendorsQuery request, CancellationToken cancellationToken)
    {
        var party = await db.Parties.SingleAsync(p => p.Id == request.PartyId, cancellationToken);
        var (place, latitude, longitude) = await OriginAsync(party, cancellationToken);
        var categories = VendorCategories.All[request.Category];
        var items = await db.CatalogueItems.Where(i => categories.Contains(i.Category)).ToListAsync(cancellationToken);
        var available = items
            .Where(i => i.IsAvailableOn(party.Date))
            .Where(i => latitude is null || Distance.Kilometres(latitude.Value, longitude!.Value, i.Latitude, i.Longitude) <= i.ServiceRadiusKm)
            .ToList();

        var themeOn = party.Theme is not null && request.Theme != "off";
        bool Themed(CatalogueItem i) => !themeOn || i.Themes.Any(t => party.Theme!.Contains(t, StringComparison.OrdinalIgnoreCase));
        bool Affordable(CatalogueItem i, decimal? max) => max is null || i.Price <= max;
        var matches = available.Where(i => Themed(i) && Affordable(i, request.MaxPrice)).OrderByDescending(i => i.Vendor?.Rating ?? 0).ToList();

        var allergies = await AllergiesAsync(party, cancellationToken);
        var plan = party.BookingsToDo.ToList();
        return new VendorSearchResult(
            request.Category,
            Parties.PartySummaryMapper.DatePattern.Format(party.Date),
            place,
            party.Theme,
            themeOn,
            matches.Select(i => Result(i, allergies, plan)).ToList(),
            request.Category == "food" ? allergies : [],
            matches.Count > 0 ? null : NoResults(request, party, themeOn, available.Where(Themed).ToList(), available.Where(i => Affordable(i, request.MaxPrice)).ToList()));
    }

    private static VendorResult Result(CatalogueItem item, IReadOnlyList<AllergyGroup> allergies, IReadOnlyList<BookingToDo> plan)
    {
        var profile = item.Vendor ?? new VendorProfile();
        var inPlan = plan.FirstOrDefault(b => b.CatalogueItemId == item.Id || b.Name == item.Name);
        return new VendorResult(
            item.Id,
            item.Name,
            profile.Emoji,
            item.Description,
            item.Category.ToString(),
            item.Neighbourhood,
            item.Price,
            item.PriceBasis,
            profile.Rating,
            profile.ReviewCount,
            profile.DurationMinutes,
            profile.MinAge,
            profile.MaxAge,
            profile.NoticeDays,
            DietaryOptions.Where(d => d.Allergens.All(item.IsFreeOf)).Select(d => d.Label)
                .Concat(item.HasFeature("vegan") ? ["vegan"] : []).ToList(),
            allergies.Select(a => new AllergyFit(a.Allergen, item.IsFreeOf(a.Allergen))).ToList(),
            inPlan is null ? null : inPlan.Status switch
            {
                BookingStatus.Confirmed => "booked",
                BookingStatus.QuoteRequested => "quoteRequested",
                BookingStatus.Quoted => "quoteReceived",
                _ => "inYourPlan",
            });
    }

    private async Task<(string? Place, double? Latitude, double? Longitude)> OriginAsync(Party party, CancellationToken cancellationToken)
    {
        var venue = party.BookingsToDo.FirstOrDefault(b => b.Category == "Venue" && b.Status == BookingStatus.Confirmed);
        if (venue is not null)
        {
            var item = await db.CatalogueItems.FirstOrDefaultAsync(i => i.Id == venue.CatalogueItemId || i.Name == venue.Name, cancellationToken);
            if (item is not null)
            {
                return (item.Name, item.Latitude, item.Longitude);
            }
        }

        return party.Area is { } area ? (area.Name, area.Latitude, area.Longitude) : (null, null, null);
    }

    /// <summary>Allergies of children who may come, by allergen; party notes no child covers are listed without names.</summary>
    private async Task<IReadOnlyList<AllergyGroup>> AllergiesAsync(Party party, CancellationToken cancellationToken)
    {
        var guests = await db.Guests.Where(g => g.PartyId == party.Id && g.Rsvp != RsvpStatus.CantCome && g.Allergies != null).ToListAsync(cancellationToken);
        var groups = guests
            .GroupBy(g => Allergens.Canonical(g.Allergies!))
            .ToDictionary(g => g.Key, g => (IReadOnlyList<string>)g.Select(x => x.ChildFirstName).Order().ToList());
        foreach (var note in party.Allergies.Select(Allergens.Canonical))
        {
            groups.TryAdd(note, []);
        }

        return groups.OrderBy(g => g.Key).Select(g => new AllergyGroup(g.Key, g.Value)).ToList();
    }

    private static VendorNoResults NoResults(SearchVendorsQuery request, Party party, bool themeOn, List<CatalogueItem> themedAnyPrice, List<CatalogueItem> affordableAnyTheme)
    {
        var conflicts = new List<string>();
        if (request.MaxPrice is { } max)
        {
            conflicts.Add($"under ${max:0}");
        }

        if (themeOn)
        {
            conflicts.Add($"for the {party.Theme} theme");
        }

        VendorSuggestion? suggestion = null;
        if (request.MaxPrice is not null && themedAnyPrice.Count > 0)
        {
            var cheapest = themedAnyPrice.Min(i => i.Price);
            suggestion = new VendorSuggestion($"Raise to ${cheapest:0}", "maxPrice", cheapest.ToString("0"));
        }
        else if (themeOn && affordableAnyTheme.Count > 0)
        {
            suggestion = new VendorSuggestion("Show every theme", "theme", "off");
        }

        return new VendorNoResults(conflicts, suggestion);
    }
}
