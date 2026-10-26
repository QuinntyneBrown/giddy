using System.Security.Cryptography;

namespace Giddy.Api.Errors;

/// <summary>A short code a parent can quote to support, like "GDY-7Q2K".</summary>
public static class ReferenceCode
{
    private const string Alphabet = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";

    public static string Create() => "GDY-" + RandomNumberGenerator.GetString(Alphabet, 4);
}
