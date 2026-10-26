using NodaTime;

namespace Giddy.Domain.Parents;

/// <summary>
/// A single-use link for confirming an email or resetting a password. Only a hash of the token is
/// stored, so a database leak can't be used to take over accounts.
/// </summary>
public sealed class AccountToken
{
    private AccountToken()
    {
        TokenHash = string.Empty;
    }

    public AccountToken(Guid parentId, AccountTokenPurpose purpose, string tokenHash, Instant createdAt, Duration lifetime)
    {
        Id = Guid.NewGuid();
        ParentId = parentId;
        Purpose = purpose;
        TokenHash = tokenHash;
        CreatedAt = createdAt;
        ExpiresAt = createdAt + lifetime;
    }

    public Guid Id { get; private set; }

    public Guid ParentId { get; private set; }

    public AccountTokenPurpose Purpose { get; private set; }

    public string TokenHash { get; private set; }

    public Instant CreatedAt { get; private set; }

    public Instant ExpiresAt { get; private set; }

    public Instant? UsedAt { get; private set; }

    public bool IsUsableAt(Instant now) => UsedAt is null && now < ExpiresAt;

    public void Use(Instant now) => UsedAt = now;
}
