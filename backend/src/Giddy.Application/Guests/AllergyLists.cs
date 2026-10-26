using Giddy.Domain.Guests;

namespace Giddy.Application.Guests;

public static class AllergyLists
{
    /// <summary>Every child who is coming or may come with an allergy, by first name only.</summary>
    public static IReadOnlyList<AllergyEntry> For(IEnumerable<Guest> guests) =>
        guests
            .Where(g => g.HasAllergies && g.Rsvp != RsvpStatus.CantCome)
            .OrderBy(g => g.ChildName, StringComparer.CurrentCultureIgnoreCase)
            .Select(g => new AllergyEntry(g.ChildFirstName, g.Allergies!))
            .ToList();
}
