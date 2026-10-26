namespace Giddy.Application.Accounts.SignIn;

public sealed class SignInPausedException() : Exception("Sign-in is paused for 15 minutes to keep your account safe");
