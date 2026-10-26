using System.Globalization;
using NodaTime;

namespace Giddy.Application.Bookings;

/// <summary>Dates and times the way parents read them, for example "Sat 14 Nov, 1:00–3:30 pm".</summary>
public static class BookingText
{
    public static string Day(LocalDate date) => date.ToString("ddd d MMM", CultureInfo.InvariantCulture);

    public static string Time(LocalTime time) => time.ToString("h:mm tt", CultureInfo.InvariantCulture).ToLowerInvariant();

    public static string Range(LocalTime start, LocalTime end) =>
        (start.Hour < 12) == (end.Hour < 12)
            ? $"{start.ToString("h:mm", CultureInfo.InvariantCulture)}–{Time(end)}"
            : $"{Time(start)}–{Time(end)}";

    public static string Money(decimal amount) => $"${amount:0.##}";
}
