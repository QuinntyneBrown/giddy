namespace Giddy.Application.Accounts;

/// <summary>A confirmation or reset link that is too old or already used.</summary>
/// <param name="email">Whose link it was, so a fresh one can be offered; null when unknown.</param>
public sealed class LinkExpiredException(string message, string? email) : Exception(message)
{
    public string? Email { get; } = email;
}
