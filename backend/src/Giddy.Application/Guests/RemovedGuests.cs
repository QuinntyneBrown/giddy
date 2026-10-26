using NodaTime;

namespace Giddy.Application.Guests;

public static class RemovedGuests
{
    /// <summary>How long Undo can bring a removed guest back before they are purged.</summary>
    public static readonly Duration UndoWindow = Duration.FromMinutes(10);
}
