using Giddy.Application.Parties;
using MediatR;

namespace Giddy.Application.Wrapping;

public sealed record SaveTemplateCommand(Guid PartyId) : IRequest<SavedTemplate>, IPartyRequest
{
    public PartyAccess RequiredAccess => PartyAccess.WrapUp;
}
