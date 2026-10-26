using NodaTime;

namespace Giddy.Domain.Parties;

/// <summary>A dated planning task, worked back from the party date.</summary>
public sealed record ChecklistTask(string Title, LocalDate Due, bool Done = false);
