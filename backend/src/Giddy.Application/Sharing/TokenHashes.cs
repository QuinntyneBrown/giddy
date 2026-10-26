using System.Security.Cryptography;
using System.Text;

namespace Giddy.Application.Sharing;

/// <summary>Links carry a random token; only its hash is stored.</summary>
public static class TokenHashes
{
    public static string NewToken() =>
        Convert.ToBase64String(RandomNumberGenerator.GetBytes(24)).Replace('+', '-').Replace('/', '_').TrimEnd('=');

    public static string Of(string token) => Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(token)));
}
