using Giddy.Application.Parties;
using MediatR;

namespace Giddy.Application.RunSheets;

/// <summary>"Draft my run sheet": Giddy's timed steps from the plan, for a party with none.</summary>
public sealed record DraftRunSheetCommand(Guid PartyId) : IRequest<RunSheetView>, IPartyRequest
{
    public PartyAccess RequiredAccess => PartyAccess.Plan;
}
