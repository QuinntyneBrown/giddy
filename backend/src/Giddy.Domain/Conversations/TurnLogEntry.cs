using NodaTime;

namespace Giddy.Domain.Conversations;

/// <summary>
/// Support and safety record of a turn: the prompt, each tool call and result, and the reply.
/// Kept for 90 days with the party ID; payment data is never written here.
/// </summary>
public sealed class TurnLogEntry
{
    public static readonly Duration Retention = Duration.FromDays(90);

    private TurnLogEntry()
    {
        Kind = string.Empty;
        Content = string.Empty;
    }

    public TurnLogEntry(Guid id, Guid turnId, Guid conversationId, Guid? partyId, string kind, string content, Instant at)
    {
        Id = id;
        TurnId = turnId;
        ConversationId = conversationId;
        PartyId = partyId;
        Kind = kind;
        Content = content;
        At = at;
    }

    public Guid Id { get; private set; }

    public Guid TurnId { get; private set; }

    public Guid ConversationId { get; private set; }

    public Guid? PartyId { get; private set; }

    /// <summary>prompt, tool_call, tool_result or reply.</summary>
    public string Kind { get; private set; }

    public string Content { get; private set; }

    public Instant At { get; private set; }
}
