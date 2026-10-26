using System.Text.Json;
using Giddy.Application.Agent.Model;
using Giddy.Domain.Proposals;

namespace Giddy.Application.Agent.Tools;

/// <summary>
/// Shows the parent a priced plan card. Items are catalogue IDs from this turn's search results;
/// names and tax-inclusive prices are filled in from the catalogue, never from the model.
/// </summary>
public sealed class ProposePlanTool(ProposalValidator validator) : IAgentTool
{
    public AgentToolDefinition Definition { get; } = new(
        "propose_plan",
        "Show the parent a plan card. Use only IDs returned by this turn's tools: one theme from list_themes, and items for venue, entertainer, cake, food and loot bags. Prices and the total are added for you.",
        ToolSchema.Parse("""
        {"type":"object","properties":{
          "title":{"type":"string","description":"The party's name, for example Zuri's Dino Dig 7th"},
          "themeId":{"type":"string"},
          "themeDetail":{"type":"string","description":"What the theme involves, in a few words"},
          "items":{"type":"array","items":{"type":"object","properties":{
            "catalogueItemId":{"type":"string"},
            "detail":{"type":"string","description":"Time slot, quantity or what is included"}},
            "required":["catalogueItemId","detail"],"additionalProperties":false}}},
         "required":["title","themeId","themeDetail","items"],"additionalProperties":false}
        """));

    public string? DescribeStart(JsonElement input, AgentTurnContext context) => null;

    public Task<ToolOutcome> RunAsync(JsonElement input, AgentTurnContext context, CancellationToken cancellationToken)
    {
        var errors = validator.Validate(input, context, out Proposal? proposal);
        if (errors.Count > 0)
        {
            return Task.FromResult(new ToolOutcome("The plan was not shown: " + string.Join(" ", errors), null, IsError: true));
        }

        context.Proposal = proposal;
        var summary = proposal!.OverBudgetBy > 0
            ? $"Plan card shown: total ${proposal.Total} is ${proposal.OverBudgetBy} over the ${proposal.Budget} budget. Say so and suggest specific changes."
            : $"Plan card shown: total ${proposal.Total}{(proposal.Budget is { } b ? $" of ${b}" : string.Empty)}.";
        return Task.FromResult(new ToolOutcome(summary, null));
    }
}
