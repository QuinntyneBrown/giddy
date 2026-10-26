namespace Giddy.Application.Accounts;

/// <summary>The email service didn't take the message.</summary>
public sealed class EmailNotSentException(string message, Exception inner) : Exception(message, inner);
