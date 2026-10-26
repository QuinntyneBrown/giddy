using Giddy.Application.Parties;
using MediatR;

namespace Giddy.Application.RunSheets;

public sealed record GetRunSheetQuery(Guid PartyId) : IRequest<RunSheetView>, IPartyRequest
{
    public PartyAccess RequiredAccess => PartyAccess.Read;
}
