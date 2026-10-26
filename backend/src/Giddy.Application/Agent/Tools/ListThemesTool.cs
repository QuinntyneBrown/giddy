using System.Text.Json;
using Giddy.Application.Agent.Model;
using Giddy.Domain.Catalogue;

namespace Giddy.Application.Agent.Tools;

public sealed class ListThemesTool(CatalogueSearch search) : IAgentTool
{
    public AgentToolDefinition Definition { get; } = new(
        "list_themes",
        "List party themes, optionally matching an interest such as dinosaurs. A proposal's theme must come from this list.",
        ToolSchema.Parse("""{"type":"object","properties":{"interest":{"type":"string"}},"additionalProperties":false}"""));

    public string? DescribeStart(JsonElement input, AgentTurnContext context) => "Picking a theme…";

    public async Task<ToolOutcome> RunAsync(JsonElement input, AgentTurnContext context, CancellationToken cancellationToken)
    {
        var interest = ToolSchema.OptionalString(input, "interest");
        var result = await search.SearchAsync(CatalogueCategory.Theme, context, interest, cancellationToken);
        return new ToolOutcome(result.Json, $"Looked at {result.Matches} themes");
    }
}
