using System.Collections.Concurrent;
using Giddy.Application.Common;

namespace Giddy.Api.IntegrationTests.Support;

public sealed class FakeEmailSender : IEmailSender
{
    public ConcurrentBag<EmailMessage> Sent { get; } = [];

    public Task SendAsync(EmailMessage message, CancellationToken cancellationToken)
    {
        Sent.Add(message);
        return Task.CompletedTask;
    }
}
