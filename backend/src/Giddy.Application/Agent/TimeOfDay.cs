using NodaTime;

namespace Giddy.Application.Agent;

public static class TimeOfDay
{
    public static string Of(LocalTime time) => time.Hour switch
    {
        < 12 => "morning",
        < 17 => "afternoon",
        _ => "evening",
    };
}
