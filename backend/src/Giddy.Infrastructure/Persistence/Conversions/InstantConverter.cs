using Microsoft.EntityFrameworkCore.Storage.ValueConversion;
using NodaTime;

namespace Giddy.Infrastructure.Persistence.Conversions;

public sealed class InstantConverter() : ValueConverter<Instant, DateTimeOffset>(
    instant => instant.ToDateTimeOffset(),
    value => Instant.FromDateTimeOffset(value));
