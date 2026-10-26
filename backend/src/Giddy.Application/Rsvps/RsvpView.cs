namespace Giddy.Application.Rsvps;

/// <summary>Only the invitation and this family's own reply; never anyone else on the list.</summary>
/// <param name="CanChange">Replies can change until the RSVP-by date.</param>
public sealed record RsvpView(RsvpInvitation Invitation, RsvpGuest Guest, RsvpQuestions Questions, bool CanChange);
