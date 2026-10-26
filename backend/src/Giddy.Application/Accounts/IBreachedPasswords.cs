namespace Giddy.Application.Accounts;

/// <summary>Whether a password appears in a known data breach.</summary>
public interface IBreachedPasswords
{
    Task<bool> IsBreachedAsync(string password, CancellationToken cancellationToken);
}
