namespace Giddy.Application.Wrapping;

/// <summary>What a new party started from a saved plan will take over.</summary>
public sealed record TemplateSummary(Guid TemplateId, string Name, Guid? ChildId, string? ChildName, string? Theme);
