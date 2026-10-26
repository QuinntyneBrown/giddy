using Giddy.Domain.Calendar;
using NodaTime;

namespace Giddy.Domain.Notifications;

/// <summary>
/// Giddy's quiet hours, 9:00 pm to 7:00 am in Toronto: non-urgent messages wait until they end.
/// Urgent messages on the party day, such as a vendor cancelling, go straight away.
/// </summary>
public static class QuietHours
{
    public static readonly LocalTime Starts = new(21, 0);
    public static readonly LocalTime Ends = new(7, 0);

    /// <param name="urgentOn">The party date when the message is urgent on that day; otherwise null.</param>
    public static Instant SendAt(Instant due, LocalDate? urgentOn)
    {
        var local = due.InZone(TorontoCalendar.Zone);
        if (urgentOn == local.Date)
        {
            return due;
        }

        if (local.TimeOfDay >= Starts)
        {
            return local.Date.PlusDays(1).At(Ends).InZoneLeniently(TorontoCalendar.Zone).ToInstant();
        }

        return local.TimeOfDay < Ends ? local.Date.At(Ends).InZoneLeniently(TorontoCalendar.Zone).ToInstant() : due;
    }
}
