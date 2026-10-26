namespace Giddy.Domain.Conversations;

public static class TurnEventTypes
{
    public const string StepStarted = "step.started";
    public const string StepDone = "step.done";
    public const string ReplyDone = "reply.done";
    public const string TurnFailed = "turn.failed";
    public const string TurnCancelled = "turn.cancelled";
}
