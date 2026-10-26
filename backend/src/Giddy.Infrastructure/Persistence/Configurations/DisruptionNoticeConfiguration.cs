using Giddy.Domain.Disruptions;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Giddy.Infrastructure.Persistence.Configurations;

public sealed class DisruptionNoticeConfiguration : IEntityTypeConfiguration<DisruptionNotice>
{
    public void Configure(EntityTypeBuilder<DisruptionNotice> builder)
    {
        builder.ToTable("DisruptionNotices");
        builder.HasKey(d => d.Id);
        builder.Property(d => d.Id).ValueGeneratedNever();
        builder.Property(d => d.Title).HasMaxLength(160);
        builder.Property(d => d.Detail).HasMaxLength(500);
        builder.HasIndex(d => d.To);
    }
}
