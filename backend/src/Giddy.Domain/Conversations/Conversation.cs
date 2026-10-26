using NodaTime;

namespace Giddy.Domain.Conversations;

/// <summary>A parent's chat with Giddy, usually about one party.</summary>
public sealed class Conversation
{
    private readonly List<ChatMessage> messages = [];

    private Conversation()
    {
    }

    public Conversation(Guid id, Guid parentId, Guid? partyId, Instant startedAt)
    {
        Id = id;
        ParentId = parentId;
        PartyId = partyId;
        StartedAt = startedAt;
    }

    public Guid Id { get; private set; }

    /// <summary>Conversations are private to the parent who started them.</summary>
    public Guid ParentId { get; private set; }

    public Guid? PartyId { get; private set; }

    public Instant StartedAt { get; private set; }

    public IReadOnlyList<ChatMessage> Messages => messages;

    public ChatMessage AddParentMessage(Guid id, string text, Instant sentAt)
    {
        var message = new ChatMessage(id, MessageAuthor.Parent, text.Trim(), sentAt);
        messages.Add(message);
        return message;
    }

    public void AddGiddyMessage(ChatMessage message) => messages.Add(message);
}
