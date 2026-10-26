namespace Giddy.Application.Checklist.View;

/// <summary>Someone a task can be given to: the owner or a co-planner.</summary>
public sealed record Planner(Guid ParentId, string Name, bool IsYou);
