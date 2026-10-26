using System.Collections.Concurrent;
using Giddy.Application.Common;

namespace Giddy.Api.IntegrationTests.Support;

public sealed class FakeEmailSender : IEmailSender
{
    public ConcurrentBag<EmailMessage> Sent { get; } = [];

    /// <summary>When set, sending fails as an unreachable email service would.</summary>
    public bool Failing { get; set; }

    public Task SendAsync(EmailMessage message, CancellationToken cancellationToken)
    {
        if (Failing)
        {
            throw new HttpRequestException("The email service didn't respond.");
        }

        Sent.Add(message);
        return Task.CompletedTask;
    }
}
