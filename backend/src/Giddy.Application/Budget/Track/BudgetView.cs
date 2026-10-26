namespace Giddy.Application.Budget.Track;

/// <summary>Everything in Canadian dollars, HST included.</summary>
/// <param name="Budget">The party's total budget, or null when none was set.</param>
/// <param name="Swaps">When over budget, Giddy's swaps that bring the total back within it.</param>
public sealed record BudgetView(
    decimal? Budget,
    decimal Planned,
    decimal Paid,
    decimal? Left,
    decimal? PerKid,
    bool Over,
    decimal OverBy,
    IReadOnlyList<CategoryTotal> Categories,
    IReadOnlyList<BudgetLine> Lines,
    IReadOnlyList<BudgetSwap> Swaps);
