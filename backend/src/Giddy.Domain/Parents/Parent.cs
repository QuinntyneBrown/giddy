using NodaTime;

namespace Giddy.Domain.Parents;

/// <summary>A parent's account: who they are, how they sign in, and what keeps it safe.</summary>
public sealed class Parent
{
    /// <summary>Failed sign-ins allowed within <see cref="FailureWindow"/> before sign-in pauses.</summary>
    public const int AllowedFailures = 5;

    public static readonly Duration FailureWindow = Duration.FromMinutes(15);
    public static readonly Duration PauseLength = Duration.FromMinutes(15);

    private Parent()
    {
        Name = string.Empty;
        Email = string.Empty;
    }

    public Parent(Guid id, string name, string email)
    {
        Id = id;
        Name = name;
        Email = email;
    }

    public Guid Id { get; private set; }

    /// <summary>The first name the parent signed up with.</summary>
    public string Name { get; private set; }

    /// <summary>Lower-case, trimmed; unique across accounts.</summary>
    public string Email { get; private set; }

    /// <summary>The password hash, or null for an account that signs in with Google or Apple only.</summary>
    public string? PasswordHash { get; private set; }

    public Instant? EmailVerifiedAt { get; private set; }

    public bool EmailVerified => EmailVerifiedAt is not null;

    /// <summary>The confirmation email couldn't be delivered.</summary>
    public bool EmailBounced { get; private set; }

    /// <summary>Party ideas and reminders by email; never sent unless the parent opted in.</summary>
    public bool MarketingOptIn { get; private set; }

    public int FailedSignIns { get; private set; }

    public Instant? FirstFailedSignInAt { get; private set; }

    public Instant? SignInPausedUntil { get; private set; }

    /// <summary>Devices the parent has signed in on, such as "Safari on iPhone".</summary>
    public List<string> KnownDevices { get; private set; } = [];

    public static Parent SignUp(Guid id, string firstName, string email, bool marketingOptIn) =>
        new(id, firstName, email) { MarketingOptIn = marketingOptIn };

    public void Update(string name, string email)
    {
        Name = name;
        Email = email;
    }

    public void SetPassword(string hash) => PasswordHash = hash;

    public void ConfirmEmail(Instant now)
    {
        EmailVerifiedAt ??= now;
        EmailBounced = false;
    }

    public void MarkEmailBounced() => EmailBounced = true;

    public bool IsSignInPausedAt(Instant now) => SignInPausedUntil is { } until && now < until;

    /// <summary>Counts a failed sign-in; the attempt after five in fifteen minutes pauses sign-in.</summary>
    public void RecordFailedSignIn(Instant now)
    {
        if (FirstFailedSignInAt is not { } first || now - first > FailureWindow)
        {
            FirstFailedSignInAt = now;
            FailedSignIns = 0;
        }

        FailedSignIns++;
    }

    /// <summary>True when this attempt follows five recent failures, so sign-in pauses for fifteen minutes.</summary>
    public bool PauseIfTooManyFailures(Instant now)
    {
        if (FailedSignIns >= AllowedFailures && FirstFailedSignInAt is { } first && now - first <= FailureWindow)
        {
            SignInPausedUntil = now + PauseLength;
            FailedSignIns = 0;
            FirstFailedSignInAt = null;
            return true;
        }

        return false;
    }

    public void ClearSignInFailures()
    {
        FailedSignIns = 0;
        FirstFailedSignInAt = null;
        SignInPausedUntil = null;
    }

    /// <summary>Remembers the device; true when it is new for an account that has signed in before.</summary>
    public bool RememberDevice(string device)
    {
        if (KnownDevices.Contains(device))
        {
            return false;
        }

        var isNew = KnownDevices.Count > 0;
        KnownDevices = [.. KnownDevices, device];
        return isNew;
    }
}
