namespace Giddy.Application.Bookings;

public sealed class SlotTakenException(string message) : Exception(message);
