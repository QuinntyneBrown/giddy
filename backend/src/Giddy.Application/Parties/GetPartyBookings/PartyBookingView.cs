using Giddy.Domain.Parties;

namespace Giddy.Application.Parties.GetPartyBookings;

/// <param name="Paid">What has been paid so far, for example a venue's deposit.</param>
/// <param name="QuoteExpiresOn">ISO date a vendor's quote is valid until, while it is quoted.</param>
public sealed record PartyBookingView(string Category, string Name, decimal Price, BookingStatus Status, decimal Paid, string? QuoteExpiresOn);
