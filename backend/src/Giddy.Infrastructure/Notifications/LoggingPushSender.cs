using Giddy.Application.Notifications;
using Giddy.Domain.Notifications;
using Microsoft.Extensions.Logging;

namespace Giddy.Infrastructure.Notifications;

/// <summary>
/// Records push messages instead of sending them, until the Web Push VAPID keys are configured
/// for an environment. The subscription itself is kept so nothing is lost when they are.
/// </summary>
public sealed class LoggingPushSender(ILogger<LoggingPushSender> logger) : IPushSender
{
    public Task SendAsync(PushSubscription subscription, string title, string body, string link, CancellationToken cancellationToken)
    {
        logger.LogInformation("Push for parent {ParentId}: {Title}", subscription.ParentId, title);
        return Task.CompletedTask;
    }
}
