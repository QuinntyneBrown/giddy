namespace Giddy.Application.Accounts.SignIn;

/// <summary>Never says whether the email or the password was wrong.</summary>
public sealed class WrongCredentialsException() : Exception("That email and password don’t match");
