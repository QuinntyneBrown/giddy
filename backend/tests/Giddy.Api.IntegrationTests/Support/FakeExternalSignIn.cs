using Giddy.Api.Authentication;
using Microsoft.AspNetCore.Http;

namespace Giddy.Api.IntegrationTests.Support;

/// <summary>Stands in for Google and Apple: the challenge comes straight back with the identity a test set.</summary>
public sealed class FakeExternalSignIn : IExternalSignIn
{
    /// <summary>What the provider returns next; null for an error or a cancelled sign-in.</summary>
    public ExternalIdentity? Next { get; set; }

    public bool IsAvailable(string provider) => provider is "google" or "apple";

    public Task ChallengeAsync(HttpContext context, string provider, string callbackUrl)
    {
        context.Response.Redirect(callbackUrl);
        return Task.CompletedTask;
    }

    public Task<ExternalIdentity?> ReadAsync(HttpContext context) => Task.FromResult(Next);

    public Task ForgetAsync(HttpContext context) => Task.CompletedTask;
}
