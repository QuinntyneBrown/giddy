using Giddy.Domain.Guests;

namespace Giddy.Application.Guests.GetGuests;

/// <param name="Email">Only planners see parents' contact details.</param>
public sealed record GuestView(
    Guid Id,
    string ChildName,
    string ParentName,
    RsvpStatus Rsvp,
    string? Allergies,
    bool? ParentStaying,
    string? Note,
    string? Email,
    string? Mobile,
    bool HasEmail,
    bool HasMobile,
    bool EmailBounced,
    string? LastRemindedAt);
