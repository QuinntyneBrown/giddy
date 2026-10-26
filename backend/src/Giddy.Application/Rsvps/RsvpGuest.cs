using Giddy.Domain.Guests;

namespace Giddy.Application.Rsvps;

public sealed record RsvpGuest(
    string ChildFirstName, string FamilyName, string ParentName, RsvpStatus Rsvp, string? Allergies, bool? ParentStaying, int? Siblings, string? Mobile, string? Note);
