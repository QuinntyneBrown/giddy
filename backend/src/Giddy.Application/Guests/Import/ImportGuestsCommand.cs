using Giddy.Application.Parties;
using MediatR;

namespace Giddy.Application.Guests.Import;

public sealed record ImportGuestsCommand(Guid PartyId, ImportFile File) : IRequest<ImportReport>, IPartyRequest
{
    public PartyAccess RequiredAccess => PartyAccess.Plan;
}
