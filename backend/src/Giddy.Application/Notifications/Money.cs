using System.Globalization;

namespace Giddy.Application.Notifications;

public static class Money
{
    /// <summary>"$40" or "$35.50".</summary>
    public static string Format(decimal amount) =>
        amount % 1 == 0
            ? string.Create(CultureInfo.InvariantCulture, $"${amount:0}")
            : string.Create(CultureInfo.InvariantCulture, $"${amount:0.00}");
}
