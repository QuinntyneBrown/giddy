using Giddy.Application.Parties;
using MediatR;

namespace Giddy.Application.Checklist.View;

public sealed record GetChecklistQuery(Guid PartyId) : IRequest<ChecklistView>, IPartyRequest
{
    public PartyAccess RequiredAccess => PartyAccess.Read;
}
