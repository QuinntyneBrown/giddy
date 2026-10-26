namespace Giddy.Application.Agent.Model;

public sealed record ModelRequest(string System, IReadOnlyList<ModelMessage> Messages, IReadOnlyList<AgentToolDefinition> Tools);
