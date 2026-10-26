using NodaTime;

namespace Giddy.Domain.Conversations;

/// <summary>A message in a conversation: the parent's words, or Giddy's reply with its work and any proposal.</summary>
public sealed class ChatMessage
{
    private ChatMessage()
    {
        Text = string.Empty;
    }

    public ChatMessage(Guid id, MessageAuthor author, string text, Instant sentAt)
    {
        Id = id;
        Author = author;
        Text = text;
        SentAt = sentAt;
    }

    public Guid Id { get; private set; }

    public MessageAuthor Author { get; private set; }

    public string Text { get; private set; }

    public Instant SentAt { get; private set; }

    public List<ToolStep> Steps { get; private set; } = [];

    /// <summary>Up to four replies the parent can send with one tap.</summary>
    public List<string> Suggestions { get; private set; } = [];

    public Guid? ProposalId { get; private set; }

    public static ChatMessage FromGiddy(
        Guid id, string text, Instant sentAt, IEnumerable<ToolStep> steps, IEnumerable<string> suggestions, Guid? proposalId) =>
        new(id, MessageAuthor.Giddy, text, sentAt)
        {
            Steps = steps.ToList(),
            Suggestions = suggestions.Take(4).ToList(),
            ProposalId = proposalId,
        };
}
