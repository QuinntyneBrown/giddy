using System.Text.Json;
using Giddy.Application.Agent.Model;

namespace Giddy.Application.Agent.Tools;

/// <summary>Offers up to four replies the parent can tap when Giddy asks a question.</summary>
public sealed class SuggestRepliesTool : IAgentTool
{
    public AgentToolDefinition Definition { get; } = new(
        "suggest_replies",
        "When your reply asks the parent a question, offer up to four short answers written in the parent's voice.",
        ToolSchema.Parse("""{"type":"object","properties":{"replies":{"type":"array","items":{"type":"string"},"maxItems":4}},"required":["replies"],"additionalProperties":false}"""));

    public string? DescribeStart(JsonElement input, AgentTurnContext context) => null;

    public Task<ToolOutcome> RunAsync(JsonElement input, AgentTurnContext context, CancellationToken cancellationToken)
    {
        context.Suggestions.Clear();
        if (input.TryGetProperty("replies", out var replies) && replies.ValueKind == JsonValueKind.Array)
        {
            context.Suggestions.AddRange(replies.EnumerateArray()
                .Where(r => r.ValueKind == JsonValueKind.String)
                .Select(r => r.GetString()!.Trim())
                .Where(r => r.Length is > 0 and <= 60)
                .Take(4));
        }

        return Task.FromResult(new ToolOutcome("Suggestions shown.", null));
    }
}
