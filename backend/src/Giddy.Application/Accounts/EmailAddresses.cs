namespace Giddy.Application.Accounts;

public static class EmailAddresses
{
    /// <summary>Emails are compared trimmed and in lower case.</summary>
    public static string Normalize(string? email) => (email ?? string.Empty).Trim().ToLowerInvariant();
}
