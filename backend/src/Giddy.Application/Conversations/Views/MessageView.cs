using Giddy.Domain.Conversations;

namespace Giddy.Application.Conversations.Views;

/// <param name="Author">parent or giddy.</param>
/// <param name="SentAt">ISO instant.</param>
public sealed record MessageView(
    Guid Id,
    string Author,
    string Text,
    string SentAt,
    IReadOnlyList<ToolStep> Steps,
    IReadOnlyList<string> Suggestions,
    ProposalView? Proposal);
