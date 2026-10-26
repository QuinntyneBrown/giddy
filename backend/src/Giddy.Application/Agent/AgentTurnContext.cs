using Giddy.Domain.Conversations;
using Giddy.Domain.Parties;
using Giddy.Domain.Proposals;
using NodaTime;

namespace Giddy.Application.Agent;

/// <summary>Everything one turn knows and has produced so far. Tools read and add to it.</summary>
public sealed class AgentTurnContext(Guid turnId, Conversation conversation, Party? party, Guid familyId, LocalDate today, Instant now)
{
    public Guid TurnId { get; } = turnId;

    public Conversation Conversation { get; } = conversation;

    public Party? Party { get; } = party;

    /// <summary>Memories and tool results are scoped to this family and never cross to another.</summary>
    public Guid FamilyId { get; } = familyId;

    public LocalDate Today { get; } = today;

    public Instant Now { get; } = now;

    public Dictionary<Guid, SeenItem> Seen { get; } = [];

    public List<ToolStep> Steps { get; } = [];

    public List<string> Suggestions { get; } = [];

    public Proposal? Proposal { get; set; }
}
