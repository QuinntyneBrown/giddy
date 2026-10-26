using Giddy.Domain.Vendors;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Giddy.Infrastructure.Persistence.Configurations;

public sealed class QuoteRequestConfiguration : IEntityTypeConfiguration<QuoteRequest>
{
    public void Configure(EntityTypeBuilder<QuoteRequest> builder)
    {
        builder.ToTable("QuoteRequests");
        builder.HasKey(q => q.Id);
        builder.Property(q => q.Id).ValueGeneratedNever();
        builder.Property(q => q.VendorName).HasMaxLength(120);
        builder.Property(q => q.Category).HasMaxLength(40);
        builder.Property(q => q.Status).HasConversion<string>().HasMaxLength(20);
        builder.Property(q => q.Note).HasMaxLength(500);
        builder.HasIndex(q => new { q.PartyId, q.VendorId });
    }
}
