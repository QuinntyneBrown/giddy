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

    public Guid OwnerId => members.Single(m => m.Role == PartyRole.Owner).ParentId;

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

    public List<Expense> Expenses { get; private set; } = [];

    /// <summary>The party day, step by step; empty until Giddy drafts it.</summary>
    public List<RunStep> RunSheet { get; private set; } = [];

    /// <summary>Everything planned: Giddy's bookings and the parent's own costs.</summary>
    public decimal Planned => BookingsToDo.Sum(b => b.Estimate) + Expenses.Sum(e => e.Amount);

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

    /// <summary>A hash of the view-only link's token; null when there is no link.</summary>
    public string? ShareLinkHash { get; private set; }

    public void SetShareLink(string tokenHash) => ShareLinkHash = tokenHash;

    /// <summary>Takes a planner off the party; the owner can't be removed.</summary>
    public bool RemoveMember(Guid parentId)
    {
        var member = members.SingleOrDefault(m => m.ParentId == parentId);
        if (member is null || member.Role == PartyRole.Owner)
        {
            return false;
        }

        members.Remove(member);
        return true;
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
            Checklist = [.. Checklist, new ChecklistTask(AllergyListTask, Date.PlusDays(-7)) { GiddyAction = GiddyActions.AllergyList }];
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
        var today = now.InZone(Calendar.TorontoCalendar.Zone).Date;
        Checklist = Checklist.Select(t => t.Title == AllergyListTask && !t.Done ? t with { Done = true, DoneOn = today } : t).ToList();
    }

    public void AllergyArrivedAfterSharing(string childFirstName)
    {
        if (AllergyListSharedAt is not null)
        {
            AllergyUpdateFor = childFirstName;
        }
    }

    /// <summary>A vendor's quote was requested: the vendor is in the plan as "Quote requested".</summary>
    public void RecordQuoteRequested(Guid vendorId, string vendorName, string category, decimal estimate) =>
        SetVendor(vendorId, vendorName, existing => existing is null
            ? new BookingToDo(category, vendorName, estimate, vendorId, BookingStatus.QuoteRequested)
            : existing with { Status = BookingStatus.QuoteRequested, CatalogueItemId = vendorId });

    /// <summary>The vendor's quote goes into the budget as "Quoted".</summary>
    public void RecordQuote(Guid vendorId, string vendorName, string category, decimal amount) =>
        SetVendor(vendorId, vendorName, existing => (existing ?? new BookingToDo(category, vendorName, amount, vendorId)) with
        {
            Status = BookingStatus.Quoted,
            Estimate = amount,
        });

    public void RecordVendorConfirmed(Guid vendorId, string vendorName) =>
        SetVendor(vendorId, vendorName, existing => existing is null ? null : existing with { Status = BookingStatus.Confirmed });

    private void SetVendor(Guid vendorId, string vendorName, Func<BookingToDo?, BookingToDo?> change)
    {
        var existing = BookingsToDo.FirstOrDefault(b => b.CatalogueItemId == vendorId || b.Name == vendorName);
        var updated = change(existing);
        if (updated is null)
        {
            return;
        }

        BookingsToDo = existing is null
            ? [.. BookingsToDo, updated]
            : BookingsToDo.Select(b => ReferenceEquals(b, existing) ? updated : b).ToList();
    }

    /// <summary>Sets or clears the party's theme; invitations, cake ideas and activities follow it.</summary>
    public void ChooseTheme(string? theme) => Theme = string.IsNullOrWhiteSpace(theme) ? null : theme.Trim();

    public void AddExpense(Expense expense) => Expenses = [.. Expenses, expense];

    public bool UpdateExpense(Expense expense)
    {
        if (Expenses.All(e => e.CostId != expense.CostId))
        {
            return false;
        }

        Expenses = Expenses.Select(e => e.CostId == expense.CostId ? expense : e).ToList();
        return true;
    }

    public bool RemoveExpense(Guid id)
    {
        var before = Expenses.Count;
        Expenses = Expenses.Where(e => e.CostId != id).ToList();
        return Expenses.Count != before;
    }

    /// <summary>Replaces the plan's item in a category with a cheaper one; it is to book again.</summary>
    public void SwapItem(string category, Guid replacementId, string replacementName, decimal price) =>
        BookingsToDo = BookingsToDo
            .Select(b => b.Category == category ? new BookingToDo(category, replacementName, price, replacementId) : b)
            .ToList();

    /// <summary>Giddy's estimates for a party with nothing planned yet.</summary>
    public void EstimateFromScratch(IEnumerable<BookingToDo> estimates)
    {
        if (BookingsToDo.Count > 0 || Expenses.Count > 0)
        {
            throw new InvalidOperationException("The party already has costs.");
        }

        BookingsToDo = estimates.ToList();
    }

    public ChecklistTask? FindTask(Guid taskId) => Checklist.SingleOrDefault(t => t.TaskId == taskId);

    /// <summary>Adds the task, or replaces the one with its id.</summary>
    public void SaveTask(ChecklistTask task) =>
        Checklist = Checklist.Any(t => t.TaskId == task.TaskId)
            ? Checklist.Select(t => t.TaskId == task.TaskId ? task : t).ToList()
            : [.. Checklist, task];

    public bool RemoveTask(Guid taskId)
    {
        var before = Checklist.Count;
        Checklist = Checklist.Where(t => t.TaskId != taskId).ToList();
        return Checklist.Count != before;
    }

    public ChecklistTask SetTaskDone(Guid taskId, bool done, LocalDate today)
    {
        var task = FindTask(taskId) ?? throw new InvalidOperationException("No such task.");
        var changed = task with { Done = done, DoneOn = done ? task.DoneOn ?? today : null };
        SaveTask(changed);
        return changed;
    }

    /// <summary>"Make my checklist": only for a party with no tasks yet.</summary>
    public void MakeChecklist(IEnumerable<ChecklistTask> tasks)
    {
        if (Checklist.Count > 0)
        {
            throw new InvalidOperationException("The party already has a checklist.");
        }

        Checklist = tasks.ToList();
    }

    /// <summary>Planners can be given tasks: the owner and co-planners, not viewers.</summary>
    public bool IsPlanner(Guid parentId) => members.Any(m => m.ParentId == parentId && m.Role != PartyRole.Viewer);

    public void DraftRunSheet(IEnumerable<RunStep> steps)
    {
        if (RunSheet.Count > 0)
        {
            throw new InvalidOperationException("The party already has a run sheet.");
        }

        RunSheet = steps.OrderBy(s => s.Time).ToList();
    }
}
