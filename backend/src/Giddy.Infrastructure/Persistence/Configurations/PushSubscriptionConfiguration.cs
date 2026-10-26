using Giddy.Domain.Notifications;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Giddy.Infrastructure.Persistence.Configurations;

public sealed class PushSubscriptionConfiguration : IEntityTypeConfiguration<PushSubscription>
{
    public void Configure(EntityTypeBuilder<PushSubscription> builder)
    {
        builder.ToTable("PushSubscriptions");
        builder.HasKey(s => s.Id);
        builder.Property(s => s.Id).ValueGeneratedNever();
        builder.Property(s => s.Endpoint).HasMaxLength(800);
        builder.Property(s => s.P256dh).HasMaxLength(200);
        builder.Property(s => s.Auth).HasMaxLength(100);
        builder.HasIndex(s => s.Endpoint).IsUnique();
    }
}
