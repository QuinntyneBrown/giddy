using System.Security.Cryptography;
using System.Text;

namespace Giddy.Api.Security;

/// <summary>Checks a webhook's shared secret in constant time; an unset secret refuses everything.</summary>
public static class SharedSecret
{
    public const string Header = "X-Giddy-Webhook-Secret";

    public static bool Matches(string? expected, string actual) =>
        !string.IsNullOrEmpty(expected)
        && CryptographicOperations.FixedTimeEquals(Encoding.UTF8.GetBytes(expected), Encoding.UTF8.GetBytes(actual));
}
