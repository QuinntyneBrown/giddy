using Giddy.Application.Parties;
using Giddy.Domain.Calendar;
using Giddy.Domain.Families;
using Giddy.Domain.Parties;
using NodaTime;

namespace Giddy.Application.Families;

public static class ChildViews
{
    /// <summary>A party counts as this birthday's when it is within a month of it.</summary>
    public static Party? PartyFor(Child child, IEnumerable<Party> parties, LocalDate today)
    {
        var next = child.NextBirthday(today);
        return parties.FirstOrDefault(p => p.ChildId == child.Id && Math.Abs(Period.Between(next, p.Date, PeriodUnits.Days).Days) <= 31);
    }

    public static ChildView For(Child child, IEnumerable<Party> parties, TorontoCalendar calendar)
    {
        var today = calendar.Today;
        return new ChildView(
            child.Id,
            child.FirstName,
            PartySummaryMapper.DatePattern.Format(child.Birthday),
            PartySummaryMapper.DatePattern.Format(child.NextBirthday(today)),
            child.TurningAge(today),
            calendar.DaysUntil(child.NextBirthday(today)),
            child.Interests,
            child.Allergies,
            PartyFor(child, parties, today)?.Id);
    }
}
