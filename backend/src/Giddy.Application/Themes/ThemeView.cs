namespace Giddy.Application.Themes;

/// <param name="MatchesInterests">The child's interests, as Giddy remembers them, include this theme.</param>
/// <param name="Chosen">The party's current theme.</param>
public sealed record ThemeView(
    Guid Id, string Name, string Emoji, string Description, int MinAge, int MaxAge, bool Outdoor, bool BudgetFriendly, bool MatchesInterests, bool Chosen);
