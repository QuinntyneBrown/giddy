using Giddy.Domain.Notifications;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Giddy.Infrastructure.Persistence.Configurations;

public sealed class InboxItemConfiguration : IEntityTypeConfiguration<InboxItem>
{
    public void Configure(EntityTypeBuilder<InboxItem> builder)
    {
        builder.ToTable("InboxItems");
        builder.HasKey(i => i.Id);
        builder.Property(i => i.Id).ValueGeneratedNever();
        builder.Property(i => i.Icon).HasMaxLength(16);
        builder.Property(i => i.Title).HasMaxLength(200);
        builder.Property(i => i.Detail).HasMaxLength(500);
        builder.Property(i => i.Link).HasMaxLength(300);
        builder.HasIndex(i => new { i.ParentId, i.CreatedAt });
    }
}
