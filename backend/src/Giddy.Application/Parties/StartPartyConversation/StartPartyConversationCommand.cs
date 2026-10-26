using Giddy.Application.Conversations.Views;
using MediatR;

namespace Giddy.Application.Parties.StartPartyConversation;

/// <summary>A new conversation with Giddy about this party, with its details as context.</summary>
public sealed record StartPartyConversationCommand(Guid PartyId) : IRequest<ConversationView>, IPartyRequest
{
    public PartyAccess RequiredAccess => PartyAccess.Plan;
}
