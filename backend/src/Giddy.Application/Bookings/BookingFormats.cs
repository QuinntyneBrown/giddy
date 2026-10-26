using NodaTime.Text;

namespace Giddy.Application.Bookings;

public static class BookingFormats
{
    public static readonly LocalTimePattern Time = LocalTimePattern.CreateWithInvariantCulture("HH:mm");

    public static readonly LocalDatePattern Date = LocalDatePattern.Iso;
}
