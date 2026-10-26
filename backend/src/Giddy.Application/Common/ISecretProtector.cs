namespace Giddy.Application.Common;

/// <summary>Encrypts small secrets at rest with keys kept outside the database.</summary>
public interface ISecretProtector
{
    string Protect(string secret);

    string Unprotect(string protectedSecret);
}
