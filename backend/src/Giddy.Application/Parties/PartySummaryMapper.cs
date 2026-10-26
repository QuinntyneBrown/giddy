using Giddy.Domain.Calendar;
using Giddy.Domain.Parties;
using NodaTime.Text;

namespace Giddy.Application.Parties;

public sealed class PartySummaryMapper(TorontoCalendar calendar)
{
    private static readonly LocalDatePattern DatePattern = LocalDatePattern.Iso;
    private static readonly LocalTimePattern TimePattern = LocalTimePattern.CreateWithInvariantCulture("HH:mm");

    public PartySummary Map(Party party, Guid parentId) => new(
        party.Id,
        party.Name,
        DatePattern.Format(party.Date),
        TimePattern.Format(party.StartsAt),
        TimePattern.Format(party.EndsAt),
        party.RoleOf(parentId) ?? throw new InvalidOperationException("The parent is not a member of this party."),
        calendar.DaysUntil(party.Date));
}
