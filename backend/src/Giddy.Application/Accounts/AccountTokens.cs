using System.Security.Cryptography;
using System.Text;
using Giddy.Application.Common;
using Giddy.Domain.Parents;
using Microsoft.EntityFrameworkCore;
using NodaTime;

namespace Giddy.Application.Accounts;

/// <summary>Issues single-use links and finds them again by their hash.</summary>
public sealed class AccountTokens(IGiddyDbContext db, IClock clock)
{
    public static readonly Duration VerifyLifetime = Duration.FromHours(24);
    public static readonly Duration ResetLifetime = Duration.FromMinutes(30);

    /// <summary>Stores a new token's hash and returns the token for the link.</summary>
    public string Issue(Guid parentId, AccountTokenPurpose purpose)
    {
        var token = Convert.ToBase64String(RandomNumberGenerator.GetBytes(32)).Replace('+', '-').Replace('/', '_').TrimEnd('=');
        db.AccountTokens.Add(new AccountToken(
            parentId,
            purpose,
            Hash(token),
            clock.GetCurrentInstant(),
            purpose == AccountTokenPurpose.VerifyEmail ? VerifyLifetime : ResetLifetime));
        return token;
    }

    public Task<AccountToken?> FindAsync(string? token, AccountTokenPurpose purpose, CancellationToken cancellationToken)
    {
        var hash = Hash(token ?? string.Empty);
        return db.AccountTokens.SingleOrDefaultAsync(t => t.TokenHash == hash && t.Purpose == purpose, cancellationToken);
    }

    private static string Hash(string token) => Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(token)));
}
