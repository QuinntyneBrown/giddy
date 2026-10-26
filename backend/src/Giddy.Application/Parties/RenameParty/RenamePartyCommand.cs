using MediatR;

namespace Giddy.Application.Parties.RenameParty;

public sealed record RenamePartyCommand(Guid PartyId, string Name) : IRequest<PartySummary>, IPartyRequest
{
    public PartyAccess RequiredAccess => PartyAccess.Plan;
}
