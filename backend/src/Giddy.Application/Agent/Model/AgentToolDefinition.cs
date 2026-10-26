using System.Text.Json;

namespace Giddy.Application.Agent.Model;

/// <summary>A tool offered to the model: its name, when to use it, and a JSON schema for its input.</summary>
public sealed record AgentToolDefinition(string Name, string Description, JsonElement InputSchema);
