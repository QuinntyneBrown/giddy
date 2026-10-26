using NodaTime;

namespace Giddy.Domain.Parents;

/// <summary>
/// A signed-in browser. The cookie only names the session; whether it is still valid is decided
/// here, so signing out and changing the password end it on the server.
/// </summary>
public sealed class ParentSession
{
    /// <summary>"Keep me signed in": thirty days from the last activity.</summary>
    public static readonly Duration PersistentIdle = Duration.FromDays(30);

    /// <summary>A browser-session sign-in still ends after half a day without activity.</summary>
    public static readonly Duration BrowserIdle = Duration.FromHours(12);

    private ParentSession()
    {
        Device = string.Empty;
    }

    public ParentSession(Guid parentId, bool persistent, string device, Instant now)
    {
        Id = Guid.NewGuid();
        ParentId = parentId;
        Persistent = persistent;
        Device = device;
        CreatedAt = now;
        LastSeenAt = now;
    }

    public Guid Id { get; private set; }

    public Guid ParentId { get; private set; }

    public bool Persistent { get; private set; }

    public string Device { get; private set; }

    public Instant CreatedAt { get; private set; }

    public Instant LastSeenAt { get; private set; }

    public Instant? RevokedAt { get; private set; }

    public bool IsActiveAt(Instant now) =>
        RevokedAt is null && now - LastSeenAt < (Persistent ? PersistentIdle : BrowserIdle);

    public void Touch(Instant now) => LastSeenAt = now;

    public void Revoke(Instant now) => RevokedAt ??= now;
}
