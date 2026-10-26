using Giddy.Domain.Notifications;

namespace Giddy.Application.Notifications;

/// <summary>Web Push to one browser.</summary>
public interface IPushSender
{
    Task SendAsync(PushSubscription subscription, string title, string body, string link, CancellationToken cancellationToken);
}
