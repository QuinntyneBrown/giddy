using System.Text.Encodings.Web;
using System.Text.Json;
using Giddy.Application.Common;
using Giddy.Domain.Catalogue;
using Giddy.Domain.Parties;
using Microsoft.EntityFrameworkCore;

namespace Giddy.Application.Agent;

/// <summary>
/// Searches the catalogue for one category the way every Giddy tool must: available on the party
/// date, serving the party's area, fitting the guest count, and annotated for the party's allergies.
/// </summary>
public sealed class CatalogueSearch(IGiddyDbContext db)
{
    public async Task<CatalogueSearchResult> SearchAsync(
        CatalogueCategory category, AgentTurnContext context, string? theme, CancellationToken cancellationToken)
    {
        var party = context.Party;
        var all = await db.CatalogueItems.Where(i => i.Category == category).ToListAsync(cancellationToken);
        var inArea = all
            .Select(item => (item, distance: party?.Area is { } area
                ? Distance.Kilometres(area.Latitude, area.Longitude, item.Latitude, item.Longitude)
                : 0))
            .Where(x => party?.Area is null || (x.distance <= party.Area.SearchRadiusKm && x.distance <= x.item.ServiceRadiusKm))
            .ToList();
        var matches = inArea
            .Where(x => party is null || x.item.IsAvailableOn(party.Date))
            .Where(x => party?.GuestCount is null || x.item.Fits(party.GuestCount.Value))
            .Where(x => theme is null || x.item.Themes.Length == 0 || x.item.Themes.Any(t => theme.Contains(t, StringComparison.OrdinalIgnoreCase) || t.Contains(theme, StringComparison.OrdinalIgnoreCase)))
            .OrderBy(x => x.distance)
            .ToList();

        foreach (var (item, distance) in matches)
        {
            context.Seen[item.Id] = new SeenItem(item, distance, context.Now);
        }

        var allergies = party?.Allergies ?? [];
        var results = matches.Select(x => new
        {
            id = x.item.Id,
            name = x.item.Name,
            neighbourhood = x.item.Neighbourhood,
            distanceKm = Math.Round(x.distance, 1),
            capacity = x.item.Capacity,
            priceIncludingHst = x.item.Price,
            priceCovers = x.item.PriceBasis,
            features = x.item.Features,
            freeOf = x.item.AllergyFree,
            allergyConflicts = allergies.Where(a => !x.item.IsFreeOf(a)).ToArray(),
            listing = ToolResultSanitizer.Quote(x.item.Description),
        });
        var json = JsonSerializer.Serialize(
            new
        {
            note = ToolResultSanitizer.Notice,
            partyDate = party?.Date.ToString("yyyy-MM-dd", null),
            checkedInArea = inArea.Count,
            results,
        },
            ReadableJson);
        return new CatalogueSearchResult(json, inArea.Count, matches.Count, matches.Count(x => allergies.All(a => x.item.IsFreeOf(a))));
    }

    private static readonly JsonSerializerOptions ReadableJson = new() { Encoder = JavaScriptEncoder.UnsafeRelaxedJsonEscaping };

    public static string Radius(Party? party) => party?.Area is { } area ? $"within {area.SearchRadiusKm} km" : "in the GTA";

    public static string When(Party? party) => party is null
        ? string.Empty
        : $" for {party.Date.ToString("ddd d MMM", System.Globalization.CultureInfo.InvariantCulture)} {TimeOfDay.Of(party.StartsAt)}";
}
