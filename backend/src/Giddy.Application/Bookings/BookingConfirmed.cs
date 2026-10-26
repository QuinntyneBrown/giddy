using MediatR;

namespace Giddy.Application.Bookings;

/// <summary>A venue confirmed a booking and the deposit was captured.</summary>
public sealed record BookingConfirmed(Guid BookingId, string ParentEmail) : INotification;
