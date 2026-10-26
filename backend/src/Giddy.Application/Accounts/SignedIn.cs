namespace Giddy.Application.Accounts;

/// <summary>Who signed in and their new server-side session, for the session cookie.</summary>
/// <param name="IsNew">An account created by this sign-in, which goes to family setup.</param>
public sealed record SignedIn(Guid ParentId, string Name, string Email, bool EmailVerified, Guid SessionId, bool Persistent, bool IsNew = false);
