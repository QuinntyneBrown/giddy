using Giddy.Application.Accounts;
using Giddy.Domain.Parents;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Options;

namespace Giddy.Infrastructure.Accounts;

/// <summary>ASP.NET Core Identity's hasher (PBKDF2-HMAC-SHA512) at OWASP's recommended 210,000 iterations.</summary>
public sealed class IdentityPasswords : IPasswords
{
    private readonly PasswordHasher<Parent> hasher = new(Options.Create(new PasswordHasherOptions { IterationCount = 210_000 }));

    public string Hash(Parent parent, string password) => hasher.HashPassword(parent, password);

    public bool Verify(Parent parent, string password) =>
        parent.PasswordHash is { } hash && hasher.VerifyHashedPassword(parent, hash, password) != PasswordVerificationResult.Failed;
}
