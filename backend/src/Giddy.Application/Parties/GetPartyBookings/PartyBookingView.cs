using Giddy.Domain.Parties;

namespace Giddy.Application.Parties.GetPartyBookings;

/// <param name="Paid">What has been paid so far, for example a venue's deposit.</param>
public sealed record PartyBookingView(string Category, string Name, decimal Price, BookingStatus Status, decimal Paid);
