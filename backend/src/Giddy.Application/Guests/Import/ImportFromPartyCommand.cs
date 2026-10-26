using Giddy.Application.Parties;
using MediatR;

namespace Giddy.Application.Guests.Import;

/// <summary>Reuses another of the parent's parties' guests, without their replies.</summary>
public sealed record ImportFromPartyCommand(Guid PartyId, Guid SourcePartyId) : IRequest<ImportReport>, IPartyRequest
{
    public PartyAccess RequiredAccess => PartyAccess.Plan;
}
