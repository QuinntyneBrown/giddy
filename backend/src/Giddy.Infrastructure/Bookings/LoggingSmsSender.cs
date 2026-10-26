using Giddy.Application.Common;
using Microsoft.Extensions.Logging;

namespace Giddy.Infrastructure.Bookings;

/// <summary>Records outgoing texts until an SMS provider is connected. Numbers and bodies are not logged.</summary>
public sealed class LoggingSmsSender(ILogger<LoggingSmsSender> logger) : ISmsSender
{
    public Task SendAsync(TextMessage message, CancellationToken cancellationToken)
    {
        logger.LogInformation("Text message queued ({Length} characters)", message.Body.Length);
        return Task.CompletedTask;
    }
}
