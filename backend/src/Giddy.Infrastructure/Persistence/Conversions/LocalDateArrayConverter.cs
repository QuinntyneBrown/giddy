using System.Text.Json;
using Microsoft.EntityFrameworkCore.ChangeTracking;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;
using NodaTime;

namespace Giddy.Infrastructure.Persistence.Conversions;

/// <summary>Stores a list of calendar dates as a JSON array of ISO dates.</summary>
public sealed class LocalDateArrayConverter() : ValueConverter<LocalDate[], string>(
    dates => JsonSerializer.Serialize(dates.Select(d => d.ToDateOnly()), (JsonSerializerOptions?)null),
    json => (JsonSerializer.Deserialize<DateOnly[]>(json, (JsonSerializerOptions?)null) ?? Array.Empty<DateOnly>()).Select(LocalDate.FromDateOnly).ToArray())
{
    public static readonly ValueComparer<LocalDate[]> Comparer = new(
        (a, b) => a!.SequenceEqual(b!),
        dates => dates.Aggregate(0, (hash, d) => HashCode.Combine(hash, d.GetHashCode())),
        dates => dates.ToArray());
}
