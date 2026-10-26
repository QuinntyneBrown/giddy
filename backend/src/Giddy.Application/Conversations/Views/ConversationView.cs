namespace Giddy.Application.Conversations.Views;

/// <param name="RunningTurnId">A turn still in progress, so a reloaded page can keep following it.</param>
public sealed record ConversationView(
    Guid Id,
    PartyAtAGlance? Party,
    IReadOnlyList<MessageView> Messages,
    IReadOnlyList<MemoryView> Memories,
    Guid? RunningTurnId);
