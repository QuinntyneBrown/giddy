using Microsoft.EntityFrameworkCore.Storage.ValueConversion;
using NodaTime;

namespace Giddy.Infrastructure.Persistence.Conversions;

public sealed class LocalTimeConverter() : ValueConverter<LocalTime, TimeOnly>(
    time => time.ToTimeOnly(),
    value => LocalTime.FromTimeOnly(value));
