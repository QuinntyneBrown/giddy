using Giddy.Domain.Parents;

namespace Giddy.Application.Accounts;

/// <summary>Hashes and checks passwords with ASP.NET Core Identity's hasher at OWASP-recommended cost.</summary>
public interface IPasswords
{
    string Hash(Parent parent, string password);

    bool Verify(Parent parent, string password);
}
