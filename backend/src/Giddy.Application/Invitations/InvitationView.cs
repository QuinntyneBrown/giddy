namespace Giddy.Application.Invitations;

/// <param name="EmailReach">Families on the list with an email address.</param>
/// <param name="TextReach">Families on the list with a mobile number.</param>
/// <param name="NotSent">Families who haven't been sent the invitation yet.</param>
public sealed record InvitationView(
    string Design,
    string Headline,
    string Message,
    string RsvpBy,
    bool AskAllergies,
    bool AskParentStaying,
    bool AskSiblings,
    bool ByEmail,
    bool ByText,
    int Families,
    int EmailReach,
    int TextReach,
    int NotSent,
    InvitationDetails Details,
    string? SentAt,
    string AutomaticReminderOn);
