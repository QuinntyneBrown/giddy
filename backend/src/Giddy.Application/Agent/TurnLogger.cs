using Giddy.Application.Common;
using Giddy.Domain.Conversations;

namespace Giddy.Application.Agent;

/// <summary>Writes the support and safety log of a turn: prompt, tool calls, results and reply.</summary>
public sealed class TurnLogger(IGiddyDbContext db)
{
    public void Write(AgentTurnContext context, string kind, string content) =>
        db.TurnLogs.Add(new TurnLogEntry(
            Guid.NewGuid(), context.TurnId, context.Conversation.Id, context.Party?.Id, kind, content, context.Now));
}
