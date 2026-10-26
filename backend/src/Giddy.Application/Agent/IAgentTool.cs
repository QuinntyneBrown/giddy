using System.Text.Json;
using Giddy.Application.Agent.Model;

namespace Giddy.Application.Agent;

/// <summary>
/// A capability Giddy can use. Tools only read data or prepare things for the parent to confirm;
/// none books, pays, sends messages or contacts a vendor.
/// </summary>
public interface IAgentTool
{
    AgentToolDefinition Definition { get; }

    /// <summary>The step shown while the tool runs, in plain words; null for tools that show no step.</summary>
    string? DescribeStart(JsonElement input, AgentTurnContext context);

    Task<ToolOutcome> RunAsync(JsonElement input, AgentTurnContext context, CancellationToken cancellationToken);
}
