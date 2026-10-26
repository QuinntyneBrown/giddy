using FluentValidation;
using FluentValidation.Results;
using Giddy.Application.Bookings;
using Giddy.Application.Common;
using Giddy.Domain.Catalogue;
using Giddy.Domain.Parties;
using Giddy.Domain.Vendors;
using MediatR;
using Microsoft.EntityFrameworkCore;
using NodaTime;

namespace Giddy.Application.Vendors.Quotes;

/// <summary>
/// Sends a quote request to the vendor, within the venue booking's hours, at most once a day per
/// vendor, and adds the vendor to the plan as "Quote requested".
/// </summary>
public sealed class RequestQuoteHandler(IGiddyDbContext db, IVendorDirectory directory, ICurrentParent parent, IClock clock)
    : IRequestHandler<RequestQuoteCommand, QuoteView>
{
    private static readonly Duration Pending = Duration.FromHours(24);

    public async Task<QuoteView> Handle(RequestQuoteCommand request, CancellationToken cancellationToken)
    {
        var vendor = await db.CatalogueItems.SingleOrDefaultAsync(i => i.Id == request.VendorId && i.Category != CatalogueCategory.Venue, cancellationToken)
            ?? throw new NotFoundException("Vendor not found.");
        var party = await db.Parties.SingleAsync(p => p.Id == request.PartyId, cancellationToken);
        var start = BookingFormats.Time.Parse(request.Start).Value;
        var venueBooked = party.BookingsToDo.Any(b => b.Category == "Venue" && b.Status == BookingStatus.Confirmed);
        if (venueBooked && (start < party.StartsAt || start >= party.EndsAt))
        {
            throw new ValidationException(
            [
                new ValidationFailure(nameof(request.Start), $"Choose a start time between {BookingText.Range(party.StartsAt, party.EndsAt).Replace("–", " and ")}, while you have the venue."),
            ]);
        }

        var now = clock.GetCurrentInstant();
        var since = now - Pending;
        if (await db.QuoteRequests.AnyAsync(q => q.PartyId == party.Id && q.VendorId == vendor.Id && q.Status == QuoteStatus.Requested && q.RequestedAt > since, cancellationToken))
        {
            throw new ConflictException($"You asked {vendor.Name} for a quote less than a day ago, so a request is pending.");
        }

        var category = PlanCategory(vendor.Category);
        var quote = new QuoteRequest(Guid.NewGuid(), party.Id, vendor.Id, vendor.Name, category, parent.Id, now);
        db.QuoteRequests.Add(quote);
        await directory.RequestQuoteAsync(
            vendor,
            new QuoteRequestDetails(quote.Id, request.Date, request.Start, request.Kids, request.Location.Trim(), request.Message.Trim(), parent.Name),
            cancellationToken);
        party.RecordQuoteRequested(vendor.Id, vendor.Name, category, vendor.Price);
        await db.SaveChangesAsync(cancellationToken);
        return new QuoteView(quote.Id, vendor.Id, vendor.Name, quote.Status, $"{vendor.Name} usually replies within a day.");
    }

    public static string PlanCategory(CatalogueCategory category) => category switch
    {
        CatalogueCategory.LootBags => "Loot bags",
        _ => category.ToString(),
    };
}
