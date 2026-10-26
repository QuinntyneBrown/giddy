using Giddy.Application.Parties;
using MediatR;

namespace Giddy.Application.Guests.Import;

public sealed record GetImportSourcesQuery(Guid PartyId) : IRequest<IReadOnlyList<ImportSource>>, IPartyRequest
{
    public PartyAccess RequiredAccess => PartyAccess.Plan;
}
