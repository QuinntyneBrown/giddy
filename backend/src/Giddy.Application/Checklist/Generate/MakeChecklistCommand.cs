using Giddy.Application.Checklist.View;
using Giddy.Application.Parties;
using MediatR;

namespace Giddy.Application.Checklist.Generate;

/// <summary>"Make my checklist": Giddy's dated tasks for a party with none.</summary>
public sealed record MakeChecklistCommand(Guid PartyId) : IRequest<ChecklistView>, IPartyRequest
{
    public PartyAccess RequiredAccess => PartyAccess.Plan;
}
