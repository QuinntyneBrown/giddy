using System.Text.Json;

namespace Giddy.Application.Agent.Model;

public sealed record ToolUseContent(string Id, string Name, JsonElement Input) : ModelContent;
