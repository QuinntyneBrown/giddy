namespace Giddy.Application.Accounts;

/// <summary>A request made again before it may be; says when it can be.</summary>
public sealed class TooSoonException(string message, int retryAfterSeconds) : Exception(message)
{
    public int RetryAfterSeconds { get; } = retryAfterSeconds;
}
