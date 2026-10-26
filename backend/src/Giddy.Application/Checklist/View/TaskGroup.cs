namespace Giddy.Application.Checklist.View;

/// <param name="Name">Overdue, This week, Before the party or Done.</param>
public sealed record TaskGroup(string Name, IReadOnlyList<TaskView> Tasks);
