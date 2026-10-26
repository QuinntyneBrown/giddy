using NodaTime;

namespace Giddy.Domain.Conversations;

/// <summary>One run of Giddy answering one parent message.</summary>
public sealed class AgentTurn
{
    private AgentTurn()
    {
    }

    public AgentTurn(Guid id, Guid conversationId, Guid parentMessageId, Instant startedAt)
    {
        Id = id;
        ConversationId = conversationId;
        ParentMessageId = parentMessageId;
        StartedAt = startedAt;
        Status = TurnStatus.Running;
    }

    public Guid Id { get; private set; }

    public Guid ConversationId { get; private set; }

    public Guid ParentMessageId { get; private set; }

    public Instant StartedAt { get; private set; }

    public TurnStatus Status { get; private set; }

    public List<TurnEvent> Events { get; private set; } = [];

    public void Record(string type, string? stepId = null, string? text = null, Guid? messageId = null) =>
        Events.Add(new TurnEvent(Events.Count + 1, type, stepId, text, messageId));

    public void Complete(Guid messageId)
    {
        Record(TurnEventTypes.ReplyDone, messageId: messageId);
        Status = TurnStatus.Completed;
    }

    public void Fail(string reason)
    {
        Record(TurnEventTypes.TurnFailed, text: reason);
        Status = TurnStatus.Failed;
    }

    public void Cancel()
    {
        if (Status != TurnStatus.Running)
        {
            return;
        }

        Record(TurnEventTypes.TurnCancelled);
        Status = TurnStatus.Cancelled;
    }
}
