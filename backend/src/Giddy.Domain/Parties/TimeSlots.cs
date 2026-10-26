using NodaTime;

namespace Giddy.Domain.Parties;

public static class TimeSlots
{
    public static (LocalTime Start, LocalTime End) Hours(TimeSlot slot) => slot switch
    {
        TimeSlot.Morning => (new LocalTime(10, 0), new LocalTime(12, 0)),
        TimeSlot.Afternoon => (new LocalTime(13, 0), new LocalTime(15, 30)),
        _ => (new LocalTime(17, 0), new LocalTime(19, 0)),
    };
}
