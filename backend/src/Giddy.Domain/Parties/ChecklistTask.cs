using NodaTime;

namespace Giddy.Domain.Parties;

/// <summary>A dated planning task, worked back from the party date.</summary>
public sealed record ChecklistTask(string Title, LocalDate Due, bool Done = false)
{
    /// <summary>Not named Id: in the JSON column EF keys owned items by position, not by this value.</summary>
    public Guid TaskId { get; init; } = Guid.NewGuid();

    /// <summary>The planner who does it; null for the party's owner.</summary>
    public Guid? OwnerId { get; init; }

    /// <summary>Whether the owner is reminded the morning before it is due.</summary>
    public bool RemindMe { get; init; } = true;

    /// <summary>The Toronto date it was ticked off.</summary>
    public LocalDate? DoneOn { get; init; }

    /// <summary>The planner who last changed it, so a conflicting change can say who made it.</summary>
    public Guid? ChangedBy { get; init; }

    /// <summary>What Giddy can do for the parent: allergyList or rsvpReminder; null when nothing.</summary>
    public string? GiddyAction { get; init; }
}
