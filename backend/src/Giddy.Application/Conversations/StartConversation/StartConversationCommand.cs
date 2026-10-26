using Giddy.Application.Conversations.Views;
using MediatR;

namespace Giddy.Application.Conversations.StartConversation;

/// <summary>"New chat": a fresh conversation about the parent's next party.</summary>
public sealed record StartConversationCommand : IRequest<ConversationView>;
