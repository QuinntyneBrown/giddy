using System.Text.Json;
using Giddy.Application.Agent.Model;
using Giddy.Domain.Catalogue;

namespace Giddy.Application.Agent.Tools;

public sealed class FindFoodTool(CatalogueSearch search) : IAgentTool
{
    public AgentToolDefinition Definition { get; } = new(
        "find_food",
        "Find party food that delivers to the venue's area on the party date, with allergens each option is free of.",
        ToolSchema.Empty);

    public string? DescribeStart(JsonElement input, AgentTurnContext context) => "Checking party food…";

    public async Task<ToolOutcome> RunAsync(JsonElement input, AgentTurnContext context, CancellationToken cancellationToken)
    {
        var result = await search.SearchAsync(CatalogueCategory.Food, context, null, cancellationToken);
        return new ToolOutcome(result.Json, $"Checked {result.Matches} food options");
    }
}
