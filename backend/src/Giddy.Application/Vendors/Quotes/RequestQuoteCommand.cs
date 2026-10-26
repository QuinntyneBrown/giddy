using Giddy.Application.Parties;
using MediatR;

namespace Giddy.Application.Vendors.Quotes;

public sealed record RequestQuoteCommand(Guid PartyId, Guid VendorId, string Date, string Start, int Kids, string Location, string Message)
    : IRequest<QuoteView>, IPartyRequest
{
    public PartyAccess RequiredAccess => PartyAccess.Plan;
}
