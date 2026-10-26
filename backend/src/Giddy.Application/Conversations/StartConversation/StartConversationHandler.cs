using Giddy.Application.Common;
using Giddy.Application.Conversations.OpenConversation;
using Giddy.Application.Conversations.Views;
using Giddy.Domain.Calendar;
using Giddy.Domain.Conversations;
using MediatR;
using NodaTime;

namespace Giddy.Application.Conversations.StartConversation;

public sealed class StartConversationHandler(
    IGiddyDbContext db,
    ICurrentParent parent,
    TorontoCalendar calendar,
    IClock clock,
    ConversationViewBuilder views)
    : IRequestHandler<StartConversationCommand, ConversationView>
{
    public async Task<ConversationView> Handle(StartConversationCommand request, CancellationToken cancellationToken)
    {
        var conversation = new Conversation(
            Guid.NewGuid(),
            parent.Id,
            await OpenConversationHandler.NextPartyIdAsync(db, parent.Id, calendar.Today, cancellationToken),
            clock.GetCurrentInstant());
        db.Conversations.Add(conversation);
        await db.SaveChangesAsync(cancellationToken);
        return await views.BuildAsync(conversation, cancellationToken);
    }
}
