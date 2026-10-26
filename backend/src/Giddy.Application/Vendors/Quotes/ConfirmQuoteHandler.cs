using Giddy.Application.Common;
using Giddy.Domain.Vendors;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Giddy.Application.Vendors.Quotes;

public sealed class ConfirmQuoteHandler(Notifications.PlannerNews news, IGiddyDbContext db) : IRequestHandler<ConfirmQuoteCommand>
{
    public async Task Handle(ConfirmQuoteCommand request, CancellationToken cancellationToken)
    {
        var quote = await db.QuoteRequests.SingleOrDefaultAsync(q => q.Id == request.QuoteId && q.PartyId == request.PartyId, cancellationToken)
            ?? throw new NotFoundException("Quote not found.");
        if (quote.Status != QuoteStatus.Quoted)
        {
            throw new ConflictException($"{quote.VendorName} hasn’t sent a quote to confirm yet.");
        }

        quote.Accept();
        var party = await db.Parties.SingleAsync(p => p.Id == quote.PartyId, cancellationToken);
        party.RecordVendorConfirmed(quote.VendorId, quote.VendorName);
        news.TellOthers(party, "✅", $"booked {quote.VendorName}", $"For {party.Name}.", $"/parties/{party.Id}");
        await db.SaveChangesAsync(cancellationToken);
    }
}
