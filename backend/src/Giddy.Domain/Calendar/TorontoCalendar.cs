using NodaTime;

namespace Giddy.Domain.Calendar;

/// <summary>
/// Giddy's single notion of "today": the calendar date in America/Toronto. Countdowns, overdue
/// checks and locking count calendar days here, so daylight-saving changes never shift them.
/// </summary>
public sealed class TorontoCalendar(IClock clock)
{
    public static readonly DateTimeZone Zone = DateTimeZoneProviders.Tzdb["America/Toronto"];

    public LocalDate Today => clock.GetCurrentInstant().InZone(Zone).Date;

    public int DaysUntil(LocalDate date) => Period.Between(Today, date, PeriodUnits.Days).Days;
}
