using Giddy.Application.Guests.GetGuests;
using Giddy.Domain.Guests;
using NodaTime.Text;

namespace Giddy.Application.Guests;

public static class GuestViews
{
    /// <param name="planner">Only planners see parents' contact details.</param>
    public static GuestView From(Guest guest, bool planner) => new(
        guest.Id,
        guest.ChildName,
        guest.ParentName,
        guest.Rsvp,
        guest.Allergies,
        guest.ParentStaying,
        guest.Note,
        planner ? guest.Email : null,
        planner ? guest.Mobile : null,
        guest.Email is not null,
        guest.Mobile is not null,
        guest.EmailBounced,
        guest.LastRemindedAt is { } reminded ? InstantPattern.General.Format(reminded) : null);
}
