namespace Giddy.Api.Authentication;

/// <summary>Who Google or Apple says the parent is.</summary>
public sealed record ExternalIdentity(string Provider, string Email, string Name, bool EmailVerified);
