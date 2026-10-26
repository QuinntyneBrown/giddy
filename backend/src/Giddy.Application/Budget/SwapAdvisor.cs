using Giddy.Application.Budget.Track;
using Giddy.Application.Common;
using Giddy.Domain.Catalogue;
using Giddy.Domain.Parties;
using Microsoft.EntityFrameworkCore;

namespace Giddy.Application.Budget;

/// <summary>
/// Finds cheaper vendors free on the party date, near the party, for items not yet booked, and
/// returns the smallest set of swaps that brings the plan back within budget.
/// </summary>
public sealed class SwapAdvisor(IGiddyDbContext db)
{
    private static readonly Dictionary<string, CatalogueCategory> Categories = new()
    {
        ["Venue"] = CatalogueCategory.Venue,
        ["Entertainer"] = CatalogueCategory.Entertainer,
        ["Activity"] = CatalogueCategory.Activity,
        ["Cake"] = CatalogueCategory.Cake,
        ["Food"] = CatalogueCategory.Food,
        ["Loot bags"] = CatalogueCategory.LootBags,
        ["Rental"] = CatalogueCategory.Rental,
    };

    public async Task<IReadOnlyList<BudgetSwap>> SuggestAsync(Party party, decimal overBy, CancellationToken cancellationToken)
    {
        var open = party.BookingsToDo.Where(b => b.Status != BookingStatus.Confirmed && Categories.ContainsKey(b.Category)).ToList();
        var wanted = open.Select(b => Categories[b.Category]).ToList();
        var items = await db.CatalogueItems.Where(i => wanted.Contains(i.Category)).ToListAsync(cancellationToken);
        var guests = party.GuestCount ?? 0;
        var options = open
            .Select(item => (item, best: items
                .Where(i => i.Category == Categories[item.Category] && i.Name != item.Name && i.Id != item.CatalogueItemId)
                .Where(i => i.IsAvailableOn(party.Date) && i.Fits(guests) && i.PriceBasis != "per kid")
                .Where(i => party.Area is null || Distance.Kilometres(party.Area.Latitude, party.Area.Longitude, i.Latitude, i.Longitude) <= i.ServiceRadiusKm)
                .Where(i => i.Category != CatalogueCategory.Venue || i.FreeSlotsOn(party.Date).Count > 0)
                .Where(i => i.Price < item.Estimate)
                .OrderBy(i => i.Price)
                .FirstOrDefault()))
            .Where(x => x.best is not null)
            .Select(x => new BudgetSwap(x.item.Category, x.item.Name, x.item.Estimate, x.best!.Id, x.best.Name, x.best.Price, x.item.Estimate - x.best.Price))
            .ToList();

        // One swap is the least disruption: the smallest saving that is enough.
        var single = options.Where(o => o.Saving >= overBy).OrderBy(o => o.Saving).FirstOrDefault();
        if (single is not null)
        {
            return [single];
        }

        var chosen = new List<BudgetSwap>();
        foreach (var option in options.OrderByDescending(o => o.Saving))
        {
            chosen.Add(option);
            if (chosen.Sum(c => c.Saving) >= overBy)
            {
                break;
            }
        }

        return chosen;
    }
}
