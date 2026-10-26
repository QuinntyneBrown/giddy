using System.Text.Json;
using Giddy.Application.Agent.Model;
using Giddy.Domain.Catalogue;

namespace Giddy.Application.Agent.Tools;

public sealed class FindEntertainersTool(CatalogueSearch search) : IAgentTool
{
    public AgentToolDefinition Definition { get; } = new(
        "find_entertainers",
        "Compare entertainers who are free on the party date and travel to the party's area, optionally for a theme such as dinosaurs or science.",
        ToolSchema.Parse("""{"type":"object","properties":{"theme":{"type":"string","description":"A theme or interest, for example dinosaurs"}},"additionalProperties":false}"""));

    public string? DescribeStart(JsonElement input, AgentTurnContext context) => "Comparing entertainers…";

    public async Task<ToolOutcome> RunAsync(JsonElement input, AgentTurnContext context, CancellationToken cancellationToken)
    {
        var theme = ToolSchema.OptionalString(input, "theme");
        var result = await search.SearchAsync(CatalogueCategory.Entertainer, context, theme, cancellationToken);
        var kind = string.IsNullOrWhiteSpace(theme) ? "" : $"{theme.Trim().ToLowerInvariant()} ";
        return new ToolOutcome(result.Json, $"Compared {result.Matches} {kind}entertainers");
    }
}
