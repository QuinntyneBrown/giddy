namespace Giddy.Application.Agent;

/// <summary>Turns waiting for the agent worker.</summary>
public interface IAgentTurnQueue
{
    ValueTask EnqueueAsync(TurnRequest request, CancellationToken cancellationToken);

    IAsyncEnumerable<TurnRequest> DequeueAllAsync(CancellationToken cancellationToken);
}
