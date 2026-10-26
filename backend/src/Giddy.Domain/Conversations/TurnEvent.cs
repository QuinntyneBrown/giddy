namespace Giddy.Domain.Conversations;

/// <summary>
/// Progress the web app polls for: step.started, step.done, reply.done, turn.failed or turn.cancelled.
/// <paramref name="MessageId"/> points at Giddy's reply once it is done.
/// </summary>
public sealed record TurnEvent(int Sequence, string Type, string? StepId, string? Text, Guid? MessageId);
