using System.Text.Json;
using Giddy.Application.Agent.Model;
using Giddy.Domain.Catalogue;

namespace Giddy.Application.Agent.Tools;

public sealed class SearchVenuesTool(CatalogueSearch search) : IAgentTool
{
    public AgentToolDefinition Definition { get; } = new(
        "search_venues",
        "Find party venues that are free on the party date, close to the party's area and big enough for the guests. Use before proposing a venue.",
        ToolSchema.Empty);

    public string? DescribeStart(JsonElement input, AgentTurnContext context) =>
        $"Checking venues {CatalogueSearch.Radius(context.Party)}{CatalogueSearch.When(context.Party)}…";

    public async Task<ToolOutcome> RunAsync(JsonElement input, AgentTurnContext context, CancellationToken cancellationToken)
    {
        var result = await search.SearchAsync(CatalogueCategory.Venue, context, null, cancellationToken);
        return new ToolOutcome(result.Json, $"Checked {result.Checked} venues {CatalogueSearch.Radius(context.Party)}{CatalogueSearch.When(context.Party)}");
    }
}
