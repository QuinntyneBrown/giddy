using MediatR;

namespace Giddy.Application.Rsvps.SubmitRsvp;

public sealed record SubmitRsvpCommand(
    string Token, bool Coming, string? Allergies, bool? ParentStaying, int? Siblings, string ParentName, string? Mobile, string? Note)
    : IRequest<RsvpView>;
