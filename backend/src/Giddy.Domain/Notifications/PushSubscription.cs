using NodaTime;

namespace Giddy.Domain.Notifications;

/// <summary>A browser that agreed to push notifications, with the keys to encrypt them.</summary>
public sealed class PushSubscription
{
    private PushSubscription()
    {
        Endpoint = string.Empty;
        P256dh = string.Empty;
        Auth = string.Empty;
    }

    public PushSubscription(Guid parentId, string endpoint, string p256dh, string auth, Instant createdAt)
    {
        Id = Guid.NewGuid();
        ParentId = parentId;
        Endpoint = endpoint;
        P256dh = p256dh;
        Auth = auth;
        CreatedAt = createdAt;
    }

    public Guid Id { get; private set; }

    public Guid ParentId { get; private set; }

    public string Endpoint { get; private set; }

    public string P256dh { get; private set; }

    public string Auth { get; private set; }

    public Instant CreatedAt { get; private set; }
}
