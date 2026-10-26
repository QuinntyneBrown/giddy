namespace Giddy.Application.Bookings;

/// <summary>The slot is no longer free; nothing was held or charged.</summary>
public sealed class SlotUnavailableException(string message, IReadOnlyList<AlternativeSlot> alternatives) : Exception(message)
{
    public IReadOnlyList<AlternativeSlot> Alternatives { get; } = alternatives;
}
