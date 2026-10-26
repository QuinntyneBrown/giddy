using Giddy.Domain.Parents;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Giddy.Infrastructure.Persistence.Configurations;

public sealed class ParentSessionConfiguration : IEntityTypeConfiguration<ParentSession>
{
    public void Configure(EntityTypeBuilder<ParentSession> builder)
    {
        builder.ToTable("ParentSessions");
        builder.HasKey(s => s.Id);
        builder.Property(s => s.Id).ValueGeneratedNever();
        builder.Property(s => s.Device).HasMaxLength(80);
        builder.HasIndex(s => s.ParentId);
    }
}
