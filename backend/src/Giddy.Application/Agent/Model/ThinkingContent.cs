namespace Giddy.Application.Agent.Model;

/// <summary>Reasoning the model returned; echoed back unchanged within the same turn.</summary>
public sealed record ThinkingContent(string Thinking, string Signature) : ModelContent;
