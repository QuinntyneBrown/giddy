using NodaTime;

namespace Giddy.Domain.Parties;

/// <summary>A child's birthday party and the parents who can see or plan it.</summary>
public sealed class Party
{
    public const int NameMaxLength = 60;

    /// <summary>The generated checklist's task; booking a venue adds it when the plan has none.</summary>
    public const string AllergyListTask = "Share the allergy list with the venue";

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

    /// <summary>The family's child the party is for; null for someone else.</summary>
    public Guid? ChildId { get; private set; }

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

    /// <summary>When the allergy list last went to the venue.</summary>
    public Instant? AllergyListSharedAt { get; private set; }

    /// <summary>A child whose allergy arrived after the list was shared, so the venue needs an update.</summary>
    public string? AllergyUpdateFor { get; private set; }

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

    /// <summary>A party is read-only once its date has passed in Toronto.</summary>
    public bool IsLockedOn(LocalDate today) => Date < today;

    /// <summary>A party is a draft until a plan gives it things to book.</summary>
    public bool IsDraft => BookingsToDo.Count == 0;

    public bool IsOwnedBy(Guid parentId) => RoleOf(parentId) == PartyRole.Owner;

    public void Describe(string childName, int turningAge, PartyArea area, int guestCount, decimal budget, Guid? childId = null)
    {
        ChildId = childId;
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

    /// <summary>
    /// Records a confirmed venue booking: the venue shows as booked with its deposit paid, the party
    /// takes the slot's times, and the venue needs the allergy list.
    /// </summary>
    public void RecordVenueBooked(Guid venueId, string venueName, decimal price, decimal deposit, LocalTime startsAt, LocalTime endsAt)
    {
        var venue = new BookingToDo("Venue", venueName, price, venueId, BookingStatus.Confirmed, deposit);
        BookingsToDo = BookingsToDo.Any(b => b.Category == venue.Category)
            ? BookingsToDo.Select(b => b.Category == venue.Category ? venue : b).ToList()
            : [venue, .. BookingsToDo];
        StartsAt = startsAt;
        EndsAt = endsAt;
        if (!Checklist.Any(t => t.Title == AllergyListTask))
        {
            Checklist = [.. Checklist, new ChecklistTask(AllergyListTask, Date.PlusDays(-7))];
        }
    }

    /// <summary>The venue booking was cancelled: the venue is to book again, and a kept deposit stays paid.</summary>
    public void RecordVenueCancelled(bool refunded) =>
        BookingsToDo = BookingsToDo
            .Select(b => b.Category == "Venue" ? b with { Status = BookingStatus.ToBook, Paid = refunded ? 0 : b.Paid } : b)
            .ToList();

    public void MarkAllergyListShared(Instant now)
    {
        AllergyListSharedAt = now;
        AllergyUpdateFor = null;
        Checklist = Checklist.Select(t => t.Title == AllergyListTask ? t with { Done = true } : t).ToList();
    }

    public void AllergyArrivedAfterSharing(string childFirstName)
    {
        if (AllergyListSharedAt is not null)
        {
            AllergyUpdateFor = childFirstName;
        }
    }
}
