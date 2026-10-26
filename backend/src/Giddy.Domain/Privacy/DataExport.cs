using NodaTime;

namespace Giddy.Domain.Privacy;

/// <summary>A parent's data as one machine-readable archive, kept for a week.</summary>
public sealed class DataExport
{
    public static readonly Duration Kept = Duration.FromDays(7);

    private DataExport()
    {
        Json = string.Empty;
    }

    public DataExport(Guid parentId, string json, Instant now)
    {
        Id = Guid.NewGuid();
        ParentId = parentId;
        Json = json;
        CreatedAt = now;
        ExpiresAt = now + Kept;
    }

    public Guid Id { get; private set; }

    public Guid ParentId { get; private set; }

    public string Json { get; private set; }

    public Instant CreatedAt { get; private set; }

    public Instant ExpiresAt { get; private set; }
}
