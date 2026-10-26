using Giddy.Domain.Conversations;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Giddy.Infrastructure.Persistence.Configurations;

public sealed class ConversationConfiguration : IEntityTypeConfiguration<Conversation>
{
    public void Configure(EntityTypeBuilder<Conversation> builder)
    {
        builder.ToTable("Conversations");
        builder.HasKey(c => c.Id);
        builder.Property(c => c.Id).ValueGeneratedNever();
        builder.HasIndex(c => new { c.ParentId, c.StartedAt });
        builder.OwnsMany(c => c.Messages, messages =>
        {
            messages.ToJson();
            messages.Property(m => m.Id).ValueGeneratedNever();
            messages.Property(m => m.Author).HasConversion<string>();
            messages.OwnsMany(m => m.Steps);
        });
        builder.Navigation(c => c.Messages).HasField("messages").UsePropertyAccessMode(PropertyAccessMode.Field);
    }
}
