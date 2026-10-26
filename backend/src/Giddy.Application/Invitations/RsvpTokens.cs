using System.Security.Cryptography;
using System.Text;

namespace Giddy.Application.Invitations;

/// <summary>Private RSVP links: 128-bit random tokens, stored only as SHA-256 hashes.</summary>
public static class RsvpTokens
{
    public static string Create() => Base64Url(RandomNumberGenerator.GetBytes(16));

    public static string Hash(string token) => Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(token))).ToLowerInvariant();

    private static string Base64Url(byte[] bytes) => Convert.ToBase64String(bytes).TrimEnd('=').Replace('+', '-').Replace('/', '_');
}
