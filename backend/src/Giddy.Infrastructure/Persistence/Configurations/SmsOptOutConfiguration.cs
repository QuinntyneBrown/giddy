using Giddy.Domain.Notifications;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Giddy.Infrastructure.Persistence.Configurations;

public sealed class SmsOptOutConfiguration : IEntityTypeConfiguration<SmsOptOut>
{
    public void Configure(EntityTypeBuilder<SmsOptOut> builder)
    {
        builder.ToTable("SmsOptOuts");
        builder.HasKey(o => o.Number);
        builder.Property(o => o.Number).HasMaxLength(15);
    }
}
