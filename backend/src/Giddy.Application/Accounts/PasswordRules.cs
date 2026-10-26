namespace Giddy.Application.Accounts;

public static class PasswordRules
{
    public const string WeakMessage = "Use at least 10 characters, a number or a symbol";
    public const string BreachedMessage = "Choose a password that hasn’t appeared in a data breach";

    /// <summary>At least 10 characters, with a number or a symbol.</summary>
    public static bool IsStrong(string? password) =>
        password is { Length: >= 10 } && password.Any(c => char.IsDigit(c) || !char.IsLetterOrDigit(c));
}
