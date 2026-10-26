using System.Collections.Concurrent;
using Giddy.Application.Common;

namespace Giddy.Api.IntegrationTests.Support;

public sealed class FakeSmsSender : ISmsSender
{
    public ConcurrentBag<TextMessage> Sent { get; } = [];

    public Task SendAsync(TextMessage message, CancellationToken cancellationToken)
    {
        Sent.Add(message);
        return Task.CompletedTask;
    }
}
