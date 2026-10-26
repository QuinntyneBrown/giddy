using System.Threading.Channels;
using Giddy.Application.Agent;

namespace Giddy.Infrastructure.Agent;

/// <summary>An in-process queue of turns for <see cref="AgentTurnWorker"/>.</summary>
public sealed class ChannelAgentTurnQueue : IAgentTurnQueue
{
    private readonly Channel<TurnRequest> channel = Channel.CreateUnbounded<TurnRequest>();

    public ValueTask EnqueueAsync(TurnRequest request, CancellationToken cancellationToken) =>
        channel.Writer.WriteAsync(request, cancellationToken);

    public IAsyncEnumerable<TurnRequest> DequeueAllAsync(CancellationToken cancellationToken) =>
        channel.Reader.ReadAllAsync(cancellationToken);
}
