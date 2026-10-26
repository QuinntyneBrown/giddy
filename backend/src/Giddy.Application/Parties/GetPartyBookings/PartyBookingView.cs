using Giddy.Domain.Parties;

namespace Giddy.Application.Parties.GetPartyBookings;

public sealed record PartyBookingView(string Category, string Name, decimal Price, BookingStatus Status);
