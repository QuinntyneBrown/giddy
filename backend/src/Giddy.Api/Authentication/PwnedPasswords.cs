using System.Security.Cryptography;
using System.Text;
using Giddy.Application.Accounts;

namespace Giddy.Api.Authentication;

/// <summary>
/// Checks Have I Been Pwned's range API: only the first five characters of the password's SHA-1
/// leave Giddy. When the service can't be reached the password is allowed, and that is logged.
/// </summary>
public sealed class PwnedPasswords(HttpClient http, ILogger<PwnedPasswords> logger) : IBreachedPasswords
{
    public async Task<bool> IsBreachedAsync(string password, CancellationToken cancellationToken)
    {
        var hash = Convert.ToHexString(SHA1.HashData(Encoding.UTF8.GetBytes(password)));
        try
        {
            var range = await http.GetStringAsync($"https://api.pwnedpasswords.com/range/{hash[..5]}", cancellationToken);
            return range.Split('\n').Any(line => line.StartsWith(hash[5..], StringComparison.OrdinalIgnoreCase));
        }
        catch (HttpRequestException exception)
        {
            logger.LogWarning(exception, "The breached-password check was unavailable");
            return false;
        }
    }
}
