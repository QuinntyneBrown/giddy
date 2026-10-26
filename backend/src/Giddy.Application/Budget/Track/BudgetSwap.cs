namespace Giddy.Application.Budget.Track;

public sealed record BudgetSwap(string Category, string CurrentName, decimal CurrentPrice, Guid ReplacementId, string ReplacementName, decimal ReplacementPrice, decimal Saving);
