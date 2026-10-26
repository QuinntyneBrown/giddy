namespace Giddy.Application.Bookings;

/// <summary>What the venue needs to know about the booking.</summary>
public sealed record BookingContact(string Name, string Mobile, string Child, string? Notes);
