using Giddy.Application.Accounts;

namespace Giddy.Api.IntegrationTests.Support;

/// <summary>Stands in for the breached-password service with a short known list.</summary>
public sealed class FakeBreachedPasswords : IBreachedPasswords
{
    public HashSet<string> Breached { get; } = ["password123!", "letmein2024!"];

    public Task<bool> IsBreachedAsync(string password, CancellationToken cancellationToken) =>
        Task.FromResult(Breached.Contains(password));
}
