namespace Giddy.Domain.Parties;

/// <summary>A parent's membership of a party and the role it grants.</summary>
public sealed class PartyMember
{
    private PartyMember()
    {
    }

    internal PartyMember(Guid parentId, PartyRole role)
    {
        ParentId = parentId;
        Role = role;
    }

    public Guid ParentId { get; private set; }

    public PartyRole Role { get; private set; }
}
