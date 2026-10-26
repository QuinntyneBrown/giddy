namespace Giddy.Domain.Families;

/// <summary>What children can be into; their names match theme and vendor tags.</summary>
public static class Interests
{
    public const int MaxPerChild = 5;

    public static readonly IReadOnlyList<Interest> All =
    [
        new("Dinosaurs", "🦕"),
        new("Science", "🔬"),
        new("Digging", "⛏️"),
        new("Space", "🚀"),
        new("Art", "🎨"),
        new("Sports", "⚽"),
        new("Unicorns", "🦄"),
        new("Trains", "🚂"),
        new("Ocean", "🐠"),
        new("Superheroes", "🦸"),
        new("Bubbles", "🫧"),
        new("Dogs", "🐶"),
    ];

    public static bool IsKnown(string name) => All.Any(i => i.Name == name);
}
