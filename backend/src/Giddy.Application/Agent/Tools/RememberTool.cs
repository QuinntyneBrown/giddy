using System.Text.Json;
using Giddy.Application.Agent.Model;
using Giddy.Application.Common;
using Giddy.Domain.Memories;
using Microsoft.EntityFrameworkCore;

namespace Giddy.Application.Agent.Tools;

/// <summary>Stores a lasting family fact, such as an interest, an allergy or a venue preference.</summary>
public sealed class RememberTool(IGiddyDbContext db) : IAgentTool
{
    public AgentToolDefinition Definition { get; } = new(
        "remember",
        "Remember a lasting fact the parent stated about their own family for future plans: a child's interests, a guest's allergy, or a venue preference. Never contact details, payment details or anything about another family.",
        ToolSchema.Parse("""{"type":"object","properties":{"fact":{"type":"string","description":"One short sentence, for example: Zuri loves dinosaurs"}},"required":["fact"],"additionalProperties":false}"""));

    public string? DescribeStart(JsonElement input, AgentTurnContext context) => null;

    public async Task<ToolOutcome> RunAsync(JsonElement input, AgentTurnContext context, CancellationToken cancellationToken)
    {
        var fact = ToolSchema.OptionalString(input, "fact")?.Trim() ?? string.Empty;
        if (!MemoryPolicy.Allows(fact, out var reason))
        {
            return new ToolOutcome(reason!, null, IsError: true);
        }

        if (!await db.Memories.AnyAsync(m => m.FamilyId == context.FamilyId && m.Text == fact, cancellationToken))
        {
            db.Memories.Add(new Memory(Guid.NewGuid(), context.FamilyId, fact, context.Now));
            await db.SaveChangesAsync(cancellationToken);
        }

        return new ToolOutcome("Remembered.", null);
    }
}
