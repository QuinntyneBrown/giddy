using NodaTime;

namespace Giddy.Domain.Parties;

/// <summary>One timed step of the party day.</summary>
/// <param name="StepId">Not named Id: in the JSON column EF keys owned items by position, not by this value.</param>
/// <param name="Who">Who looks after it: the parent, the venue host or a vendor.</param>
/// <param name="Reminder">The one thing not to forget, such as the gluten-free slice; null when there is none.</param>
public sealed record RunStep(Guid StepId, LocalTime Time, string Title, string Details, string Who, string? Reminder);
