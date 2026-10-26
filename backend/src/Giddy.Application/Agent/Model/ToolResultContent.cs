namespace Giddy.Application.Agent.Model;

public sealed record ToolResultContent(string ToolUseId, string Content, bool IsError) : ModelContent;
