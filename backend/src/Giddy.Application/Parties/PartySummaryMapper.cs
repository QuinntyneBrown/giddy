using Giddy.Domain.Calendar;
using Giddy.Domain.Parties;
using NodaTime.Text;

namespace Giddy.Application.Parties;

public sealed class PartySummaryMapper(TorontoCalendar calendar)
{
    public static readonly LocalDatePattern DatePattern = LocalDatePattern.Iso;
    public static readonly LocalTimePattern TimePattern = LocalTimePattern.CreateWithInvariantCulture("HH:mm");

    public PartySummary Map(Party party, Guid parentId)
    {
        var locked = party.IsLockedOn(calendar.Today);
        return new PartySummary(
            party.Id,
            party.Name,
            DatePattern.Format(party.Date),
            TimePattern.Format(party.StartsAt),
            TimePattern.Format(party.EndsAt),
            party.RoleOf(parentId) ?? throw new InvalidOperationException("The parent is not a member of this party."),
            calendar.DaysUntil(party.Date),
            locked ? "past" : party.IsDraft ? "draft" : "upcoming",
            Readiness.Of(party),
            VenueOf(party),
            party.Theme,
            locked,
            party.GuestCount,
            party.Budget);
    }

    public static string? VenueOf(Party party) => party.BookingsToDo.FirstOrDefault(b => b.Category == "Venue")?.Name;
}
