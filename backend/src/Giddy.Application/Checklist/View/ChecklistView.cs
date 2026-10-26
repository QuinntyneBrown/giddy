namespace Giddy.Application.Checklist.View;

/// <param name="Next">The first task still to do, by due date; null when everything is done.</param>
public sealed record ChecklistView(
    int Done,
    int Total,
    int Percent,
    int Overdue,
    string? Next,
    string PartyDate,
    IReadOnlyList<TaskGroup> Groups,
    IReadOnlyList<Planner> Planners);
