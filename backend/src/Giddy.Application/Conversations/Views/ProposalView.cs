using Giddy.Domain.Proposals;

namespace Giddy.Application.Conversations.Views;

public sealed record ProposalView(
    Guid Id,
    string Title,
    ThemeView Theme,
    IReadOnlyList<ProposalItem> Items,
    decimal Total,
    decimal? Budget,
    decimal OverBudgetBy,
    bool Applied);
