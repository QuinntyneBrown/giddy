using Giddy.Domain.Parties;
using Microsoft.EntityFrameworkCore;
using NodaTime;

namespace Giddy.Infrastructure.Persistence.Seeding;

/// <summary>Adds the demo catalogue and the demo family's party if they are missing. Safe to run any number of times.</summary>
public sealed class DemoDataSeeder(GiddyDbContext db)
{
    public async Task SeedAsync(CancellationToken cancellationToken)
    {
        var existing = await db.CatalogueItems.Select(i => i.Id).ToListAsync(cancellationToken);
        db.CatalogueItems.AddRange(DemoCatalogue.Items().Where(i => !existing.Contains(i.Id)));
        await db.SaveChangesAsync(cancellationToken);

        if (await db.Parties.AnyAsync(p => p.Id == DemoParents.DinoParty, cancellationToken))
        {
            return;
        }

        var party = Party.Plan(
            DemoParents.DinoParty,
            "Zuri’s Dino Dig 7th",
            new LocalDate(2026, 11, 14),
            new LocalTime(13, 0),
            new LocalTime(15, 30),
            DemoParents.Amara);
        party.Describe(
            "Zuri",
            7,
            new PartyArea("Leslieville", DemoCatalogue.LeslievilleLatitude, DemoCatalogue.LeslievilleLongitude, 8),
            15,
            800);
        party.NoteAllergy("peanut");
        party.Share(DemoParents.Kemi, PartyRole.CoPlanner);
        db.Parties.Add(party);
        await db.SaveChangesAsync(cancellationToken);
    }
}
