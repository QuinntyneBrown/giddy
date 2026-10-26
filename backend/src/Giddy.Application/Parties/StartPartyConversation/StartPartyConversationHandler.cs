using Giddy.Application.Common;
using Giddy.Application.Conversations;
using Giddy.Application.Conversations.Views;
using Giddy.Domain.Conversations;
using MediatR;
using NodaTime;

namespace Giddy.Application.Parties.StartPartyConversation;

public sealed class StartPartyConversationHandler(IGiddyDbContext db, ICurrentParent parent, IClock clock, ConversationViewBuilder views)
    : IRequestHandler<StartPartyConversationCommand, ConversationView>
{
    public async Task<ConversationView> Handle(StartPartyConversationCommand request, CancellationToken cancellationToken)
    {
        var conversation = new Conversation(Guid.NewGuid(), parent.Id, request.PartyId, clock.GetCurrentInstant());
        db.Conversations.Add(conversation);
        await db.SaveChangesAsync(cancellationToken);
        return await views.BuildAsync(conversation, cancellationToken);
    }
}
