using System.Text.RegularExpressions;

namespace Giddy.Domain.Places;

/// <summary>A Canadian postal code in its canonical "A1A 1A1" form.</summary>
public sealed partial record PostalCode
{
    private PostalCode(string value) => Value = value;

    public string Value { get; }

    /// <summary>The forward sortation area: the first three characters.</summary>
    public string Fsa => Value[..3];

    public static bool TryParse(string? input, out PostalCode? postalCode)
    {
        postalCode = null;
        if (input is null)
        {
            return false;
        }

        var compact = input.Replace(" ", string.Empty, StringComparison.Ordinal).ToUpperInvariant();
        if (!Pattern().IsMatch(compact))
        {
            return false;
        }

        postalCode = new PostalCode($"{compact[..3]} {compact[3..]}");
        return true;
    }

    public override string ToString() => Value;

    // Letters D, F, I, O, Q and U are never used; W and Z never start a code.
    [GeneratedRegex("^[ABCEGHJ-NPRSTVXY][0-9][ABCEGHJ-NPRSTV-Z][0-9][ABCEGHJ-NPRSTV-Z][0-9]$")]
    private static partial Regex Pattern();
}
