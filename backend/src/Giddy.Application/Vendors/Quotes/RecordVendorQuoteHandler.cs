using System.Globalization;
using Giddy.Application.Common;
using Giddy.Domain.Live;
using MediatR;
using Microsoft.EntityFrameworkCore;
using NodaTime;
using NodaTime.Text;

namespace Giddy.Application.Vendors.Quotes;

/// <summary>Records the quote in the budget as "Quoted" and tells the parent.</summary>
public sealed class RecordVendorQuoteHandler(IGiddyDbContext db, IClock clock) : IRequestHandler<RecordVendorQuoteCommand>
{
    public async Task Handle(RecordVendorQuoteCommand request, CancellationToken cancellationToken)
    {
        var quote = await db.QuoteRequests.SingleOrDefaultAsync(q => q.Id == request.RequestId, cancellationToken)
            ?? throw new NotFoundException("Quote request not found.");
        var expires = LocalDatePattern.Iso.Parse(request.ExpiresOn);
        if (!expires.Success || request.Amount <= 0)
        {
            throw new FluentValidation.ValidationException("The quote needs an amount and an expiry date.");
        }

        quote.Quote(request.Amount, expires.Value, request.Note);
        var party = await db.Parties.SingleAsync(p => p.Id == quote.PartyId, cancellationToken);
        party.RecordQuote(quote.VendorId, quote.VendorName, quote.Category, request.Amount);
        db.PartyEvents.Add(new PartyEvent(
            party.Id,
            null,
            "quote",
            "success",
            $"{quote.VendorName} sent a quote",
            $"${request.Amount:0.##}, valid until {expires.Value.ToString("ddd d MMM", CultureInfo.InvariantCulture)}. It’s in your budget as quoted.",
            null,
            null,
            clock.GetCurrentInstant()));
        await db.SaveChangesAsync(cancellationToken);
    }
}
