namespace Giddy.Domain.Home;

/// <summary>Something Giddy wants the parent to do: a title, why, and one action.</summary>
public sealed record Nudge(Guid PartyId, string PartyName, string Title, NudgeKind Kind, string Context, string ActionLabel);
