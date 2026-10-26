using NodaTime;

namespace Giddy.Domain.Parties;

/// <summary>An invitation to plan or follow a party, sent to an email address.</summary>
public sealed class PartyInvite
{
    public static readonly Duration Lifetime = Duration.FromDays(14);

    private PartyInvite()
    {
        Email = string.Empty;
        TokenHash = string.Empty;
    }

    public PartyInvite(Guid partyId, string email, PartyRole role, string tokenHash, Guid invitedBy, Instant now)
    {
        Id = Guid.NewGuid();
        PartyId = partyId;
        Email = email;
        Role = role;
        TokenHash = tokenHash;
        InvitedBy = invitedBy;
        CreatedAt = now;
        ExpiresAt = now + Lifetime;
    }

    public Guid Id { get; private set; }

    public Guid PartyId { get; private set; }

    public string Email { get; private set; }

    public PartyRole Role { get; private set; }

    public string TokenHash { get; private set; }

    public Guid InvitedBy { get; private set; }

    public Instant CreatedAt { get; private set; }

    public Instant ExpiresAt { get; private set; }

    public Instant? AcceptedAt { get; private set; }

    public bool IsOpenAt(Instant now) => AcceptedAt is null && now < ExpiresAt;

    public void Accept(Instant now) => AcceptedAt = now;
}
