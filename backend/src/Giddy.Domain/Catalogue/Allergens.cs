namespace Giddy.Domain.Catalogue;

/// <summary>
/// Maps what parents write ("Peanut (EpiPen with parent)", "Dairy-free (lactose intolerant)") to
/// the allergens vendors declare they are free of.
/// </summary>
public static class Allergens
{
    private static readonly (string Allergen, string[] Words)[] Known =
    [
        ("peanut", ["peanut"]),
        ("tree nut", ["tree nut", "almond", "cashew", "hazelnut", "walnut", "pecan", "pistachio"]),
        ("dairy", ["dairy", "milk", "lactose"]),
        ("gluten", ["gluten", "celiac", "coeliac", "wheat"]),
        ("egg", ["egg"]),
        ("sesame", ["sesame"]),
        ("soy", ["soy"]),
        ("fish", ["fish"]),
        ("shellfish", ["shellfish", "shrimp", "prawn"]),
    ];

    /// <summary>The allergen a note names, or the note itself, lower-cased, when it names none we know.</summary>
    public static string Canonical(string note)
    {
        var text = note.Trim().ToLowerInvariant();
        return Known.FirstOrDefault(k => k.Words.Any(text.Contains)).Allergen ?? text;
    }
}
