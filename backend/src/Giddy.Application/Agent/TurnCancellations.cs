using System.Collections.Concurrent;

namespace Giddy.Application.Agent;

/// <summary>Lets the cancel endpoint stop a running turn within a second.</summary>
public sealed class TurnCancellations
{
    private readonly ConcurrentDictionary<Guid, CancellationTokenSource> running = new();

    public CancellationToken Register(Guid turnId, CancellationToken stopping)
    {
        var source = CancellationTokenSource.CreateLinkedTokenSource(stopping);
        running[turnId] = source;
        return source.Token;
    }

    public bool Cancel(Guid turnId)
    {
        if (!running.TryGetValue(turnId, out var source))
        {
            return false;
        }

        source.Cancel();
        return true;
    }

    public void Release(Guid turnId)
    {
        if (running.TryRemove(turnId, out var source))
        {
            source.Dispose();
        }
    }
}
