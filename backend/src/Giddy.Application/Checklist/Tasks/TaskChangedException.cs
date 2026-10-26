using Giddy.Application.Checklist.View;

namespace Giddy.Application.Checklist.Tasks;

/// <summary>A change made offline to a task someone else changed in the meantime.</summary>
public sealed class TaskChangedException(string message, TaskView current) : Exception(message)
{
    /// <summary>The task as it is now, for the planner to choose which version to keep.</summary>
    public TaskView Current { get; } = current;
}
