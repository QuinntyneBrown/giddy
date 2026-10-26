namespace Giddy.Application.Guests.SendReminders;

public sealed record ReminderOutcome(Guid GuestId, string Child, string Reason);
