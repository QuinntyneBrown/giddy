using Giddy.Application.Common;
using Giddy.Application.Guests;
using Giddy.Domain.Catalogue;
using Giddy.Domain.Guests;
using Giddy.Domain.Parties;
using Microsoft.EntityFrameworkCore;
using NodaTime.Text;

namespace Giddy.Application.RunSheets;

/// <summary>The run sheet with its quick calls and allergy list, read from the plan and the guest list.</summary>
public sealed class RunSheetReader(IGiddyDbContext db)
{
    private static readonly LocalTimePattern Time = LocalTimePattern.CreateWithInvariantCulture("HH:mm");

    public async Task<RunSheetView> ViewAsync(Party party, CancellationToken cancellationToken)
    {
        var guests = await db.Guests.Where(g => g.PartyId == party.Id).ToListAsync(cancellationToken);
        var items = await ItemsAsync(party, cancellationToken);
        var contacts = party.BookingsToDo
            .Select(b => (booking: b, item: items.GetValueOrDefault(b.Category)))
            .Where(x => x.item?.Phone is not null)
            .Select(x => x.booking.Category == "Venue"
                ? new QuickCall(x.item!.ContactName ?? x.item.Name, x.item.ContactName is null ? "Venue" : $"{x.item.Name} host", x.item.Phone!)
                : new QuickCall(x.item!.Name, x.booking.Category, x.item.Phone!))
            .ToList();
        return new RunSheetView(
            LocalDatePattern.Iso.Format(party.Date),
            Time.Format(party.StartsAt),
            Time.Format(party.EndsAt),
            guests.Count(g => g.Rsvp == RsvpStatus.Coming),
            party.RunSheet.OrderBy(s => s.Time).Select(s => new RunStepView(s.StepId, Time.Format(s.Time), s.Title, s.Details, s.Who, s.Reminder)).ToList(),
            contacts,
            AllergyLists.For(guests));
    }

    /// <summary>The catalogue item behind each category of the plan, by its id or, for older plans, its name.</summary>
    public async Task<Dictionary<string, CatalogueItem>> ItemsAsync(Party party, CancellationToken cancellationToken)
    {
        var ids = party.BookingsToDo.Where(b => b.CatalogueItemId is not null).Select(b => b.CatalogueItemId!.Value).ToList();
        var names = party.BookingsToDo.Select(b => b.Name).ToList();
        var items = await db.CatalogueItems.Where(i => ids.Contains(i.Id) || names.Contains(i.Name)).ToListAsync(cancellationToken);
        return party.BookingsToDo
            .Select(b => (b.Category, item: items.FirstOrDefault(i => i.Id == b.CatalogueItemId) ?? items.FirstOrDefault(i => i.Name == b.Name)))
            .Where(x => x.item is not null)
            .GroupBy(x => x.Category)
            .ToDictionary(g => g.Key, g => g.First().item!);
    }
}
