using MediatR;

namespace Giddy.Application.Conversations.CancelTurn;

public sealed record CancelTurnCommand(Guid ConversationId, Guid TurnId) : IRequest;
