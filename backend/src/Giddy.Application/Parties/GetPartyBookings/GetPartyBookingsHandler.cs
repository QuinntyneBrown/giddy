using Giddy.Application.Common;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Giddy.Application.Parties.GetPartyBookings;

public sealed class GetPartyBookingsHandler(IGiddyDbContext db) : IRequestHandler<GetPartyBookingsQuery, IReadOnlyList<PartyBookingView>>
{
    public async Task<IReadOnlyList<PartyBookingView>> Handle(GetPartyBookingsQuery request, CancellationToken cancellationToken)
    {
        var party = await db.Parties.SingleAsync(p => p.Id == request.PartyId, cancellationToken);
        var quotes = await db.QuoteRequests
            .Where(q => q.PartyId == request.PartyId && q.Status == Domain.Vendors.QuoteStatus.Quoted)
            .ToListAsync(cancellationToken);
        return party.BookingsToDo.Select(b => new PartyBookingView(
            b.Category,
            b.Name,
            b.Estimate,
            b.Status,
            b.Paid,
            b.Status == Domain.Parties.BookingStatus.Quoted && quotes.FirstOrDefault(q => q.VendorId == b.CatalogueItemId)?.ExpiresOn is { } expires
                ? NodaTime.Text.LocalDatePattern.Iso.Format(expires)
                : null)).ToList();
    }
}
