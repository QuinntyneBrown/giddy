using System.Text.Json;
using Giddy.Domain.Catalogue;
using Giddy.Domain.Proposals;
using NodaTime;

namespace Giddy.Application.Agent;

/// <summary>
/// Stops a proposal reaching the parent unless every item came from this turn's tool results,
/// was checked in the last 15 minutes, is free on the date, serves the area and fits the guests.
/// Allergy conflicts are flagged on the item rather than hidden.
/// </summary>
public sealed class ProposalValidator
{
    public static readonly Duration Freshness = Duration.FromMinutes(15);

    public IReadOnlyList<string> Validate(JsonElement input, AgentTurnContext context, out Proposal? proposal)
    {
        proposal = null;
        var errors = new List<string>();
        var party = context.Party;
        if (party is null)
        {
            errors.Add("This conversation has no party to plan yet; ask the parent to start one.");
            return errors;
        }

        var themeId = ParseId(input, "themeId");
        SeenItem? theme = null;
        if (themeId is null || !context.Seen.TryGetValue(themeId.Value, out theme) || theme.Item.Category != CatalogueCategory.Theme)
        {
            errors.Add("The theme must be one returned by list_themes in this turn.");
        }

        var items = new List<ProposalItem>();
        if (input.TryGetProperty("items", out var itemsJson) && itemsJson.ValueKind == JsonValueKind.Array)
        {
            foreach (var itemJson in itemsJson.EnumerateArray())
            {
                var id = ParseId(itemJson, "catalogueItemId");
                if (id is null || !context.Seen.TryGetValue(id.Value, out var seen) || seen.Item.Category == CatalogueCategory.Theme)
                {
                    errors.Add($"{id?.ToString() ?? "An item"} was not in this turn's search results.");
                    continue;
                }

                var item = seen.Item;
                if (context.Now - seen.CheckedAt > Freshness)
                {
                    errors.Add($"{item.Name}'s availability is out of date; search again.");
                }
                else if (!item.IsAvailableOn(party.Date))
                {
                    errors.Add($"{item.Name} is not available on {party.Date:yyyy-MM-dd}.");
                }
                else if (party.GuestCount is { } guests && !item.Fits(guests))
                {
                    errors.Add($"{item.Name} cannot host {guests} kids.");
                }
                else if (party.Area is { } area && (seen.DistanceKm > area.SearchRadiusKm || seen.DistanceKm > item.ServiceRadiusKm))
                {
                    errors.Add($"{item.Name} does not serve {area.Name}.");
                }
                else
                {
                    var conflicts = party.Allergies.Where(a => !item.IsFreeOf(a)).ToList();
                    var note = conflicts.Count == 0 || item.Category is CatalogueCategory.Entertainer or CatalogueCategory.LootBags
                        ? null
                        : $"Not {string.Join(" or ", conflicts)}-free";
                    var detail = ToolSchema.OptionalString(itemJson, "detail")?.Trim() ?? item.PriceBasis;
                    items.Add(new ProposalItem(Label(item.Category), item.Id, item.Name, detail, item.Price, note));
                }
            }
        }

        if (items.Count == 0 && errors.Count == 0)
        {
            errors.Add("A plan needs at least one item.");
        }

        if (errors.Count > 0)
        {
            return errors;
        }

        proposal = new Proposal(
            Guid.NewGuid(),
            context.Conversation.Id,
            party.Id,
            ToolSchema.OptionalString(input, "title")?.Trim() is { Length: > 0 } title ? title : party.Name,
            theme!.Item.Name,
            ToolSchema.OptionalString(input, "themeDetail")?.Trim() ?? theme.Item.PriceBasis,
            items,
            party.Budget,
            context.Now);
        return errors;
    }

    public static string Label(CatalogueCategory category) => category switch
    {
        CatalogueCategory.LootBags => "Loot bags",
        _ => category.ToString(),
    };

    private static Guid? ParseId(JsonElement json, string name) =>
        Guid.TryParse(ToolSchema.OptionalString(json, name), out var id) ? id : null;
}
