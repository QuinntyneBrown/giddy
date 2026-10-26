using Giddy.Application.Common;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Giddy.Application.Invitations.GetInvitation;

public sealed class GetInvitationHandler(IGiddyDbContext db, InvitationReader reader) : IRequestHandler<GetInvitationQuery, InvitationView>
{
    public async Task<InvitationView> Handle(GetInvitationQuery request, CancellationToken cancellationToken)
    {
        var party = await db.Parties.SingleAsync(p => p.Id == request.PartyId, cancellationToken);
        return await reader.ViewAsync(party, await reader.LoadOrDraftAsync(party, cancellationToken), cancellationToken);
    }
}
