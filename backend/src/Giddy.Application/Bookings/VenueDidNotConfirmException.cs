namespace Giddy.Application.Bookings;

public sealed class VenueDidNotConfirmException(string message) : Exception(message);
