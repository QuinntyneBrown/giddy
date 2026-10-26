using NodaTime;

namespace Giddy.Domain.Notifications;

/// <summary>A number that replied STOP: Giddy never texts it again.</summary>
public sealed class SmsOptOut
{
    private SmsOptOut()
    {
        Number = string.Empty;
    }

    public SmsOptOut(string number, Instant at)
    {
        Number = number;
        At = at;
    }

    /// <summary>The ten-digit North American number, digits only.</summary>
    public string Number { get; private set; }

    public Instant At { get; private set; }

    /// <summary>"+1 (416) 555-0131" and "416-555-0131" are the same number.</summary>
    public static string Normalize(string number)
    {
        var digits = new string(number.Where(char.IsDigit).ToArray());
        return digits.Length > 10 ? digits[^10..] : digits;
    }
}
