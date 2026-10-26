using NodaTime;

namespace Giddy.Domain.Parties;

/// <summary>A child's birthday party and the parents who can see or plan it.</summary>
public sealed class Party
{
    public const int NameMaxLength = 60;

    private readonly List<PartyMember> members = [];

    private Party()
    {
        Name = string.Empty;
    }

    private Party(Guid id, string name, LocalDate date, LocalTime startsAt, LocalTime endsAt)
    {
        Id = id;
        Name = name;
        Date = date;
        StartsAt = startsAt;
        EndsAt = endsAt;
    }

    public Guid Id { get; private set; }

    public string Name { get; private set; }

    /// <summary>The party's calendar date in America/Toronto.</summary>
    public LocalDate Date { get; private set; }

    public LocalTime StartsAt { get; private set; }

    public LocalTime EndsAt { get; private set; }

    public IReadOnlyCollection<PartyMember> Members => members;

    public static Party Plan(Guid id, string name, LocalDate date, LocalTime startsAt, LocalTime endsAt, Guid ownerId)
    {
        var party = new Party(id, name.Trim(), date, startsAt, endsAt);
        party.members.Add(new PartyMember(ownerId, PartyRole.Owner));
        return party;
    }

    public void Share(Guid parentId, PartyRole role)
    {
        if (members.Any(m => m.ParentId == parentId))
        {
            throw new InvalidOperationException("The parent is already a member of this party.");
        }

        members.Add(new PartyMember(parentId, role));
    }

    public PartyRole? RoleOf(Guid parentId) => members.SingleOrDefault(m => m.ParentId == parentId)?.Role;

    public void Rename(string name) => Name = name.Trim();
}
