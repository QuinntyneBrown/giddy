using Giddy.Application.Parties;
using MediatR;

namespace Giddy.Application.Vendors.Quotes;

/// <summary>Accepts a vendor's quote: the vendor is booked in the plan.</summary>
public sealed record ConfirmQuoteCommand(Guid PartyId, Guid QuoteId) : IRequest, IPartyRequest
{
    public PartyAccess RequiredAccess => PartyAccess.Plan;
}
