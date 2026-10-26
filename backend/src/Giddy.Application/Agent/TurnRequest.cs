namespace Giddy.Application.Agent;

/// <summary>A turn to run, with the parent's name for Giddy to use.</summary>
public sealed record TurnRequest(Guid TurnId, string ParentName);
