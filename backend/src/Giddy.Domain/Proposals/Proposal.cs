using NodaTime;

namespace Giddy.Domain.Proposals;

/// <summary>A priced plan Giddy proposed in a conversation, validated against this turn's tool results.</summary>
public sealed class Proposal
{
    private Proposal()
    {
        Title = string.Empty;
        ThemeName = string.Empty;
        ThemeDetail = string.Empty;
    }

    public Proposal(
        Guid id,
        Guid conversationId,
        Guid partyId,
        string title,
        string themeName,
        string themeDetail,
        IEnumerable<ProposalItem> items,
        decimal? budget,
        Instant proposedAt)
    {
        Id = id;
        ConversationId = conversationId;
        PartyId = partyId;
        Title = title;
        ThemeName = themeName;
        ThemeDetail = themeDetail;
        Items = items.ToList();
        Budget = budget;
        ProposedAt = proposedAt;
    }

    public Guid Id { get; private set; }

    public Guid ConversationId { get; private set; }

    public Guid PartyId { get; private set; }

    public string Title { get; private set; }

    public string ThemeName { get; private set; }

    public string ThemeDetail { get; private set; }

    public List<ProposalItem> Items { get; private set; } = [];

    public decimal? Budget { get; private set; }

    public Instant ProposedAt { get; private set; }

    public Instant? AppliedAt { get; private set; }

    public decimal Total => Items.Sum(i => i.Price);

    /// <summary>How far over budget the plan is; zero when it fits.</summary>
    public decimal OverBudgetBy => Budget is { } budget && Total > budget ? Total - budget : 0;

    public void MarkApplied(Instant at) => AppliedAt = at;
}
