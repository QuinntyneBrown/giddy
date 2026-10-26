namespace Giddy.Application.Privacy;

/// <param name="LiveBookings">Confirmed bookings for parties still to come, which deletion doesn't cancel.</param>
public sealed record DeletionCheck(int LiveBookings);
