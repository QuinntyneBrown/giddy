using Microsoft.EntityFrameworkCore.Storage.ValueConversion;
using NodaTime;

namespace Giddy.Infrastructure.Persistence.Conversions;

public sealed class LocalDateConverter() : ValueConverter<LocalDate, DateOnly>(
    date => date.ToDateOnly(),
    value => LocalDate.FromDateOnly(value));
