using Giddy.Domain.Proposals;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Giddy.Infrastructure.Persistence.Configurations;

public sealed class ProposalConfiguration : IEntityTypeConfiguration<Proposal>
{
    public void Configure(EntityTypeBuilder<Proposal> builder)
    {
        builder.ToTable("Proposals");
        builder.HasKey(p => p.Id);
        builder.Property(p => p.Id).ValueGeneratedNever();
        builder.Property(p => p.Title).HasMaxLength(120);
        builder.Property(p => p.ThemeName).HasMaxLength(80);
        builder.Ignore(p => p.Total);
        builder.Ignore(p => p.OverBudgetBy);
        builder.HasIndex(p => p.PartyId);
        builder.OwnsMany(p => p.Items, items => items.ToJson());
    }
}
