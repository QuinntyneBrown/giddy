using Giddy.Domain.Notifications;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Giddy.Infrastructure.Persistence.Configurations;

public sealed class ScheduledNotificationConfiguration : IEntityTypeConfiguration<ScheduledNotification>
{
    public void Configure(EntityTypeBuilder<ScheduledNotification> builder)
    {
        builder.ToTable("Notifications");
        builder.HasKey(n => n.Id);
        builder.Property(n => n.Id).ValueGeneratedNever();
        builder.Property(n => n.Key).HasMaxLength(200);
        builder.Property(n => n.Subject).HasMaxLength(200);
        builder.Property(n => n.Body).HasMaxLength(4000);
        builder.HasIndex(n => n.Key).IsUnique();
        builder.HasIndex(n => new { n.SentAt, n.SendAt });
    }
}
