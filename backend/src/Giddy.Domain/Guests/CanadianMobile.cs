namespace Giddy.Domain.Guests;

/// <summary>A Canadian mobile number: ten digits (optionally after a leading 1) with a Canadian area code.</summary>
public static class CanadianMobile
{
    private static readonly HashSet<string> AreaCodes =
    [
        "204", "226", "236", "249", "250", "257", "263", "289", "306", "343", "354", "365", "367", "368", "382", "387",
        "403", "416", "418", "428", "431", "437", "438", "450", "460", "468", "474", "506", "514", "519", "548", "579",
        "581", "584", "587", "604", "613", "639", "647", "672", "683", "705", "709", "742", "753", "778", "780", "782",
        "807", "819", "825", "867", "873", "879", "902", "905", "942",
    ];

    public static bool IsValid(string? value)
    {
        var digits = new string((value ?? string.Empty).Where(char.IsDigit).ToArray());
        if (digits.Length == 11 && digits[0] == '1')
        {
            digits = digits[1..];
        }

        return digits.Length == 10 && AreaCodes.Contains(digits[..3]);
    }
}
