namespace Giddy.Api.Endpoints;

public sealed record SaveInvitationRequest(
    string? Design, string? Headline, string? Message, string? RsvpBy,
    bool AskAllergies, bool AskParentStaying, bool AskSiblings, bool ByEmail, bool ByText);
