using Giddy.Domain.Conversations;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Giddy.Infrastructure.Persistence.Configurations;

public sealed class TurnLogEntryConfiguration : IEntityTypeConfiguration<TurnLogEntry>
{
    public void Configure(EntityTypeBuilder<TurnLogEntry> builder)
    {
        builder.ToTable("TurnLogs");
        builder.HasKey(l => l.Id);
        builder.Property(l => l.Id).ValueGeneratedNever();
        builder.Property(l => l.Kind).HasMaxLength(20);
        builder.HasIndex(l => l.At);
        builder.HasIndex(l => l.PartyId);
    }
}
