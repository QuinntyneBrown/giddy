namespace Giddy.Api.Authentication;

/// <summary>The round trip to Google or Apple.</summary>
public interface IExternalSignIn
{
    /// <summary>Whether the provider is configured; without its client id it can't be offered.</summary>
    bool IsAvailable(string provider);

    Task ChallengeAsync(HttpContext context, string provider, string callbackUrl);

    /// <summary>The identity the provider returned; null when it failed or the parent cancelled.</summary>
    Task<ExternalIdentity?> ReadAsync(HttpContext context);

    Task ForgetAsync(HttpContext context);
}
