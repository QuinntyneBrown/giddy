using Giddy.Application.Conversations.Views;
using MediatR;

namespace Giddy.Application.Conversations.GetTurn;

/// <param name="After">Only events with a higher sequence number are returned.</param>
public sealed record GetTurnQuery(Guid ConversationId, Guid TurnId, int After) : IRequest<TurnView>;
