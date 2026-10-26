namespace Giddy.Application.Parents;

/// <param name="EmailBounced">The confirmation email couldn't be delivered.</param>
public sealed record Account(bool EmailBounced);
