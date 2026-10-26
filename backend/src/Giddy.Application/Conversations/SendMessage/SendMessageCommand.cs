using Giddy.Application.Conversations.Views;
using MediatR;

namespace Giddy.Application.Conversations.SendMessage;

public sealed record SendMessageCommand(Guid ConversationId, string Text) : IRequest<MessageAccepted>
{
    public const int TextMaxLength = 2000;
}
