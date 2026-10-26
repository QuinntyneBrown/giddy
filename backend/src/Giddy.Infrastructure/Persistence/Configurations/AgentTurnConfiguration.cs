using Giddy.Domain.Conversations;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Giddy.Infrastructure.Persistence.Configurations;

public sealed class AgentTurnConfiguration : IEntityTypeConfiguration<AgentTurn>
{
    public void Configure(EntityTypeBuilder<AgentTurn> builder)
    {
        builder.ToTable("AgentTurns");
        builder.HasKey(t => t.Id);
        builder.Property(t => t.Id).ValueGeneratedNever();
        builder.Property(t => t.Status).HasConversion<string>().HasMaxLength(20);
        builder.HasIndex(t => t.ConversationId);
        builder.OwnsMany(t => t.Events, events => events.ToJson());
    }
}
