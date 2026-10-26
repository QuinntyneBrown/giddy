namespace Giddy.Application.Invitations.SendInvitations;

/// <param name="Sent">Families invited by this send.</param>
/// <param name="AutomaticReminderOn">When Giddy reminds families who haven't replied.</param>
public sealed record InvitationsSent(int Sent, string AutomaticReminderOn);
