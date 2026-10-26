using Giddy.Domain.Live;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Giddy.Infrastructure.Persistence.Configurations;

public sealed class PartyEventConfiguration : IEntityTypeConfiguration<PartyEvent>
{
    public void Configure(EntityTypeBuilder<PartyEvent> builder)
    {
        builder.ToTable("PartyEvents");
        builder.HasKey(e => e.Id);
        builder.Property(e => e.Id).ValueGeneratedOnAdd();
        builder.Property(e => e.Kind).HasMaxLength(20);
        builder.Property(e => e.Tone).HasMaxLength(20);
        builder.Property(e => e.Title).HasMaxLength(160);
        builder.Property(e => e.Text).HasMaxLength(500);
        builder.Property(e => e.ActionLabel).HasMaxLength(80);
        builder.Property(e => e.ActionKind).HasMaxLength(40);
        builder.HasIndex(e => new { e.PartyId, e.Id });
    }
}
