namespace Giddy.Domain.Wrapping;

/// <summary>A checklist task from a saved plan, due the same number of days before the next party.</summary>
public sealed record TemplateTask(string Title, int DaysBefore, string? GiddyAction);
