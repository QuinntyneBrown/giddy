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

    /// <summary>The birthday child's first name, for example "Zuri".</summary>
    public string? ChildName { get; private set; }

    /// <summary>The age the child is turning.</summary>
    public int? TurningAge { get; private set; }

    /// <summary>Where the party should be, as a place parents recognise and a point to measure from.</summary>
    public PartyArea? Area { get; private set; }

    /// <summary>About how many children are coming.</summary>
    public int? GuestCount { get; private set; }

    /// <summary>The total budget in Canadian dollars, HST included.</summary>
    public decimal? Budget { get; private set; }

    /// <summary>Allergies and dietary needs among the guests, for example "peanut" or "gluten".</summary>
    public string[] Allergies { get; private set; } = [];

    public string? Theme { get; private set; }

    public List<BookingToDo> BookingsToDo { get; private set; } = [];

    public List<ChecklistTask> Checklist { get; private set; } = [];

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

    public void Describe(string childName, int turningAge, PartyArea area, int guestCount, decimal budget)
    {
        ChildName = childName.Trim();
        TurningAge = turningAge;
        Area = area;
        GuestCount = guestCount;
        Budget = budget;
    }

    public void NoteAllergy(string allergy)
    {
        var normalised = allergy.Trim().ToLowerInvariant();
        if (!Allergies.Contains(normalised))
        {
            Allergies = [.. Allergies, normalised];
        }
    }

    /// <summary>
    /// Applies an accepted plan in one go: the theme, a booking to do per item with its estimate,
    /// and the dated checklist. Nothing is booked or paid; the parent confirms each booking later.
    /// </summary>
    public void ApplyPlan(string theme, IEnumerable<BookingToDo> bookings, IEnumerable<ChecklistTask> tasks)
    {
        Theme = theme;
        BookingsToDo = bookings.ToList();
        Checklist = tasks.ToList();
    }
}
