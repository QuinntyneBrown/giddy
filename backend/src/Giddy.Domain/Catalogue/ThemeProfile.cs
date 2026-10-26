namespace Giddy.Domain.Catalogue;

/// <summary>Who a party theme suits and what it needs.</summary>
public sealed class ThemeProfile
{
    public string Emoji { get; set; } = "🎈";

    public int MinAge { get; set; }

    public int MaxAge { get; set; }

    public bool Outdoor { get; set; }

    public bool BudgetFriendly { get; set; }
}
