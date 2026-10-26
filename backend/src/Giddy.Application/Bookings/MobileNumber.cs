namespace Giddy.Application.Bookings;

/// <summary>A North American mobile number: ten digits, optionally after a leading 1.</summary>
public static class MobileNumber
{
    public static bool IsValid(string? value)
    {
        var digits = new string((value ?? string.Empty).Where(char.IsDigit).ToArray());
        return digits.Length == 10 || (digits.Length == 11 && digits[0] == '1');
    }
}
