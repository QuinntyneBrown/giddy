using Giddy.Domain.Families;
using Giddy.Domain.Parents;
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

        var notices = await db.Disruptions.Select(d => d.Id).ToListAsync(cancellationToken);
        db.Disruptions.AddRange(DemoDisruptions.Notices().Where(d => !notices.Contains(d.Id)));
        await db.SaveChangesAsync(cancellationToken);

        if (!await db.Parents.AnyAsync(p => p.Id == DemoParents.Amara, cancellationToken))
        {
            db.Parents.AddRange(
                new Parent(DemoParents.Amara, "Amara Okafor", "amara.okafor@example.com"),
                new Parent(DemoParents.Kemi, "Kemi Okafor", "kemi.okafor@example.com"));
            var family = new Family(DemoParents.Amara, "M4M 1H1");
            family.AddChild(new Child(DemoParents.Zuri, "Zuri", new LocalDate(2019, 11, 14)));
            family.AddChild(new Child(DemoParents.Kofi, "Kofi", new LocalDate(2023, 2, 3)));
            db.Families.Add(family);
            await db.SaveChangesAsync(cancellationToken);
        }

        if (await db.Parties.AnyAsync(p => p.Id == DemoParents.DinoParty, cancellationToken))
        {
            await SeedGuestsAsync(cancellationToken);
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
            800,
            DemoParents.Zuri);
        party.NoteAllergy("peanut");
        party.Share(DemoParents.Kemi, PartyRole.CoPlanner);
        db.Parties.Add(party);
        await db.SaveChangesAsync(cancellationToken);
        await SeedGuestsAsync(cancellationToken);
    }

    private async Task SeedGuestsAsync(CancellationToken cancellationToken)
    {
        if (await db.Guests.AnyAsync(g => g.PartyId == DemoParents.DinoParty, cancellationToken))
        {
            return;
        }

        db.Guests.AddRange(DemoGuests.For(DemoParents.DinoParty));
        await db.SaveChangesAsync(cancellationToken);
    }
}