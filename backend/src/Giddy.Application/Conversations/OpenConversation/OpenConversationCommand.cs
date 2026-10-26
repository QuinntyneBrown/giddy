using Giddy.Application.Conversations.Views;
using MediatR;

namespace Giddy.Application.Conversations.OpenConversation;

/// <summary>The parent's latest conversation, started for their next party when there is none.</summary>
public sealed record OpenConversationCommand : IRequest<ConversationView>;
