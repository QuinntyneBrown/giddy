using Giddy.Domain.Parties;
using NodaTime;

namespace Giddy.Domain.Wrapping;

/// <summary>
/// A finished party's theme, vendors and checklist, kept to start next year's party from, with
/// a reminder about eight weeks before the child's next birthday.
/// </summary>
public sealed class PartyTemplate
{
    public const int RemindDaysBefore = 56;

    private PartyTemplate()
    {
        Name = string.Empty;
    }

    public PartyTemplate(Party party, LocalDate? remindOn, Instant now)
    {
        Id = Guid.NewGuid();
        SourcePartyId = party.Id;
        OwnerId = party.OwnerId;
        Name = party.Name;
        ChildId = party.ChildId;
        ChildName = party.ChildName;
        Theme = party.Theme;
        Bookings = party.BookingsToDo.Select(b => new TemplateBooking(b.Category, b.Name, b.Estimate, b.CatalogueItemId)).ToList();
        Tasks = party.Checklist
            .Select(t => new TemplateTask(t.Title, Period.Between(t.Due, party.Date, PeriodUnits.Days).Days, t.GiddyAction))
            .ToList();
        RemindOn = remindOn;
        CreatedAt = now;
    }

    public Guid Id { get; private set; }

    public Guid SourcePartyId { get; private set; }

    public Guid OwnerId { get; private set; }

    public string Name { get; private set; }

    public Guid? ChildId { get; private set; }

    public string? ChildName { get; private set; }

    public string? Theme { get; private set; }

    public List<TemplateBooking> Bookings { get; private set; } = [];

    public List<TemplateTask> Tasks { get; private set; } = [];

    /// <summary>About eight weeks before the child's next birthday; null when there is no child to plan for.</summary>
    public LocalDate? RemindOn { get; private set; }

    public Instant? RemindedAt { get; private set; }

    public Instant CreatedAt { get; private set; }

    public void Reminded(Instant now) => RemindedAt = now;
}
