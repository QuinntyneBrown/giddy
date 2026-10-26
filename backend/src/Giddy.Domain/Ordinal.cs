namespace Giddy.Domain;

public static class Ordinal
{
    /// <summary>"1st", "2nd", "7th", "11th", "22nd".</summary>
    public static string Of(int n)
    {
        var teen = n % 100 is >= 11 and <= 13;
        var suffix = teen ? "th" : (n % 10) switch { 1 => "st", 2 => "nd", 3 => "rd", _ => "th" };
        return $"{n}{suffix}";
    }
}
