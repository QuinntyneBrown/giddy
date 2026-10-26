namespace Giddy.Application.Guests.SendReminders;

/// <param name="Reminded">First names of the children whose families were reminded.</param>
/// <param name="Skipped">Families not reminded on purpose, with why.</param>
/// <param name="Undeliverable">Families Giddy has no working way to reach.</param>
public sealed record RemindersSent(IReadOnlyList<string> Reminded, IReadOnlyList<ReminderOutcome> Skipped, IReadOnlyList<ReminderOutcome> Undeliverable);
