using Giddy.Domain.Conversations;

namespace Giddy.Application.Conversations.Views;

/// <param name="Status">running, completed, cancelled or failed.</param>
public sealed record TurnView(Guid TurnId, string Status, IReadOnlyList<TurnEvent> Events);
