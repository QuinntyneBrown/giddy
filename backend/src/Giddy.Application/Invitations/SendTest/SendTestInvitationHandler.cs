using Giddy.Application.Common;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Giddy.Application.Invitations.SendTest;

public sealed class SendTestInvitationHandler(IGiddyDbContext db, InvitationReader reader, IEmailSender email, IWebLinks links, ICurrentParent parent)
    : IRequestHandler<SendTestInvitationCommand>
{
    public async Task Handle(SendTestInvitationCommand request, CancellationToken cancellationToken)
    {
        var party = await db.Parties.SingleAsync(p => p.Id == request.PartyId, cancellationToken);
        var invitation = await reader.LoadOrDraftAsync(party, cancellationToken);
        var details = await reader.DetailsAsync(party, cancellationToken);
        await email.SendAsync(InvitationMessages.Email(parent.Email, invitation, details, links.To($"/parties/{party.Id}/invite")), cancellationToken);
    }
}
