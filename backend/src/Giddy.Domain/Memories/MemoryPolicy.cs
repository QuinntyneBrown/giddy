using System.Text.RegularExpressions;

namespace Giddy.Domain.Memories;

/// <summary>
/// Decides what Giddy may remember: preferences, interests and allergies. Contact details and
/// payment data are refused.
/// </summary>
public static partial class MemoryPolicy
{
    public static bool Allows(string fact, out string? reason)
    {
        reason = null;
        if (string.IsNullOrWhiteSpace(fact) || fact.Trim().Length > Memory.TextMaxLength)
        {
            reason = "Keep memories to one short sentence.";
        }
        else if (Email().IsMatch(fact) || Phone().IsMatch(fact))
        {
            reason = "Giddy doesn’t remember contact details.";
        }
        else if (Card().IsMatch(fact) || fact.Contains("card", StringComparison.OrdinalIgnoreCase) && Digits().IsMatch(fact))
        {
            reason = "Giddy never remembers payment details.";
        }

        return reason is null;
    }

    [GeneratedRegex(@"[^\s@]+@[^\s@]+\.[^\s@]+")]
    private static partial Regex Email();

    [GeneratedRegex(@"(\+?1[\s.-]?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}")]
    private static partial Regex Phone();

    [GeneratedRegex(@"\b(?:\d[ -]?){13,19}\b")]
    private static partial Regex Card();

    [GeneratedRegex(@"\d{4}")]
    private static partial Regex Digits();
}
