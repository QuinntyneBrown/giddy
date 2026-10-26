using Giddy.Domain.Parties;
using Giddy.Infrastructure.Persistence.Seeding;
using NodaTime;

namespace Giddy.Api.IntegrationTests.Support;

public static class TestData
{
    /// <summary>Zuri's Dino Dig 7th on Sat 14 Nov 2026, 1:00–3:30 pm, planned by Amara.</summary>
    public static Party DinoParty(LocalDate? date = null)
    {
        var party = Party.Plan(
            Guid.NewGuid(),
            "Zuri’s Dino Dig 7th",
            date ?? new LocalDate(2026, 11, 14),
            new LocalTime(13, 0),
            new LocalTime(15, 30),
            TestParent.Amara.Id);
        party.Describe(
            "Zuri",
            7,
            new PartyArea("Leslieville", DemoCatalogue.LeslievilleLatitude, DemoCatalogue.LeslievilleLongitude, 8),
            15,
            800);
        party.NoteAllergy("peanut");
        party.Share(TestParent.Kemi.Id, PartyRole.CoPlanner);
        party.Share(TestParent.Dev.Id, PartyRole.Viewer);
        return party;
    }

    public static Party StrangersParty() => Party.Plan(
        Guid.NewGuid(),
        "Noah’s Space Party",
        new LocalDate(2026, 12, 5),
        new LocalTime(10, 0),
        new LocalTime(12, 0),
        TestParent.Stranger.Id);
}
