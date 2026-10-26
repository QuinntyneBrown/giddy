using Giddy.Application.Common;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Giddy.Application.Parties.GetPartyBookings;

public sealed class GetPartyBookingsHandler(IGiddyDbContext db) : IRequestHandler<GetPartyBookingsQuery, IReadOnlyList<PartyBookingView>>
{
    public async Task<IReadOnlyList<PartyBookingView>> Handle(GetPartyBookingsQuery request, CancellationToken cancellationToken)
    {
        var party = await db.Parties.SingleAsync(p => p.Id == request.PartyId, cancellationToken);
        return party.BookingsToDo.Select(b => new PartyBookingView(b.Category, b.Name, b.Estimate, b.Status, b.Paid)).ToList();
    }
}
