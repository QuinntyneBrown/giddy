using System.Text.Json;
using Giddy.Application.Agent.Model;
using Giddy.Domain.Catalogue;

namespace Giddy.Application.Agent.Tools;

public sealed class FindCakesTool(CatalogueSearch search) : IAgentTool
{
    public AgentToolDefinition Definition { get; } = new(
        "find_cakes",
        "Find bakeries that can make the birthday cake for the party date, with which allergens each cake is free of.",
        ToolSchema.Empty);

    public string? DescribeStart(JsonElement input, AgentTurnContext context) => "Finding bakeries…";

    public async Task<ToolOutcome> RunAsync(JsonElement input, AgentTurnContext context, CancellationToken cancellationToken)
    {
        var result = await search.SearchAsync(CatalogueCategory.Cake, context, null, cancellationToken);
        var allergies = context.Party?.Allergies ?? [];
        var done = allergies.Length == 0
            ? $"Found {result.Matches} bakeries"
            : $"Found {result.AllergySafe} bakeries with {string.Join("- and ", allergies)}-free cakes";
        return new ToolOutcome(result.Json, done);
    }
}
