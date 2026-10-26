using Giddy.Application.Guests;
using Giddy.Domain.Catalogue;
using Giddy.Domain.Parties;
using NodaTime;

namespace Giddy.Application.RunSheets;

/// <summary>
/// Works out the day from the plan: set-up 45 minutes before, food delivered 15 minutes before,
/// the entertainer half an hour in, food after the show, cake 45 minutes before the end, loot
/// bags at the door and pick-up at the end. The food step carries the allergy reminder.
/// </summary>
public static class RunSheetDrafter
{
    public static IReadOnlyList<RunStep> Draft(Party party, string ownerFirstName, IReadOnlyDictionary<string, CatalogueItem> items, IReadOnlyList<AllergyEntry> allergies)
    {
        string Booked(string category) => party.BookingsToDo.FirstOrDefault(b => b.Category == category)?.Name ?? string.Empty;
        var venue = Booked("Venue");
        var host = items.GetValueOrDefault("Venue")?.ContactName;
        var steps = new List<RunStep>
        {
            Step(party.StartsAt.PlusMinutes(-45), "Arrive and set up", venue.Length > 0 ? $"{venue} · set up the room and the gift table" : "Set up the room and the gift table", ownerFirstName),
            Step(party.StartsAt, "Guests arrive", "Greet families and check names against the guest list", host ?? ownerFirstName),
        };

        var food = Booked("Food");
        if (food.Length > 0)
        {
            steps.Add(Step(party.StartsAt.PlusMinutes(-15), $"{food} delivery", items.GetValueOrDefault("Food")?.PriceBasis ?? "Food for everyone", food));
        }

        var showEnds = party.StartsAt.PlusMinutes(60);
        var entertainer = Booked("Entertainer");
        if (entertainer.Length > 0)
        {
            var minutes = items.GetValueOrDefault("Entertainer")?.Vendor?.DurationMinutes ?? 45;
            var starts = party.StartsAt.PlusMinutes(30);
            showEnds = starts.PlusMinutes(minutes);
            steps.Add(Step(starts, entertainer, $"{minutes} min show · kids sit together at the front", entertainer));
        }

        var reminder = allergies.Count == 0
            ? null
            : string.Join(" · ", allergies.Select((a, i) => $"{(i == 0 ? a.Allergy : char.ToLowerInvariant(a.Allergy[0]) + a.Allergy[1..])} for {a.Child}"));
        steps.Add(Step(showEnds, "Food and drinks", food.Length > 0 ? $"{food} · juice and water" : "Snacks, juice and water", ownerFirstName, reminder));

        var cake = Booked("Cake");
        steps.Add(Step(party.EndsAt.PlusMinutes(-45), "Cake and Happy Birthday", cake.Length > 0 ? $"{cake} cake · candles and lighter in the kit" : "Candles and lighter in the kit", ownerFirstName));
        if (Booked("Loot bags").Length > 0)
        {
            steps.Add(Step(party.EndsAt.PlusMinutes(-20), "Loot bags", "One per kid at the door", ownerFirstName));
        }

        steps.Add(Step(party.EndsAt, "Pick-up and goodbyes", "Check every kid leaves with a grown-up on the list", ownerFirstName));
        return steps.OrderBy(s => s.Time).ToList();
    }

    private static RunStep Step(LocalTime time, string title, string details, string who, string? reminder = null) =>
        new(Guid.NewGuid(), time, title, details, who, reminder);
}
