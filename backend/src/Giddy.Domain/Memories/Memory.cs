using NodaTime;

namespace Giddy.Domain.Memories;

/// <summary>A lasting fact Giddy keeps for one family's future plans, such as an interest or an allergy.</summary>
public sealed class Memory
{
    public const int TextMaxLength = 140;

    private Memory()
    {
        Text = string.Empty;
    }

    public Memory(Guid id, Guid familyId, string text, Instant rememberedAt)
    {
        Id = id;
        FamilyId = familyId;
        Text = text;
        RememberedAt = rememberedAt;
    }

    public Guid Id { get; private set; }

    /// <summary>Until families arrive (journey 13), the parent who stated the fact.</summary>
    public Guid FamilyId { get; private set; }

    public string Text { get; private set; }

    public Instant RememberedAt { get; private set; }
}
