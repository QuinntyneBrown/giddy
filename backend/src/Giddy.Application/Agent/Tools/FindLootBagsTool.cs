using System.Text.Json;
using Giddy.Application.Agent.Model;
using Giddy.Domain.Catalogue;

namespace Giddy.Application.Agent.Tools;

public sealed class FindLootBagsTool(CatalogueSearch search) : IAgentTool
{
    public AgentToolDefinition Definition { get; } = new(
        "find_loot_bags",
        "Find loot bag ideas that fit the theme and guest count.",
        ToolSchema.Parse("""{"type":"object","properties":{"theme":{"type":"string"}},"additionalProperties":false}"""));

    public string? DescribeStart(JsonElement input, AgentTurnContext context) => "Finding loot bags…";

    public async Task<ToolOutcome> RunAsync(JsonElement input, AgentTurnContext context, CancellationToken cancellationToken)
    {
        var result = await search.SearchAsync(CatalogueCategory.LootBags, context, ToolSchema.OptionalString(input, "theme"), cancellationToken);
        return new ToolOutcome(result.Json, $"Found {result.Matches} loot bag ideas");
    }
}
