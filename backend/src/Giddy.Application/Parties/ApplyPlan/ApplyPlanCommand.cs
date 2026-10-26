using MediatR;

namespace Giddy.Application.Parties.ApplyPlan;

public sealed record ApplyPlanCommand(Guid PartyId, Guid ProposalId) : IRequest<PlanApplied>, IPartyRequest
{
    public PartyAccess RequiredAccess => PartyAccess.Plan;
}
