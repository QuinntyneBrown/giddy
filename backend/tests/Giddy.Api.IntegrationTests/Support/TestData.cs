using Giddy.Domain.Families;
using Giddy.Domain.Guests;
using Giddy.Domain.Parents;
using Giddy.Domain.Parties;
using Giddy.Infrastructure.Persistence;
using Giddy.Infrastructure.Persistence.Seeding;
using NodaTime;

namespace Giddy.Api.IntegrationTests.Support;

public static class TestData
{
    public static readonly Guid Zuri = Guid.Parse("11111111-2222-4333-8444-000000000001");
    public static readonly Guid Kofi = Guid.Parse("11111111-2222-4333-8444-000000000002");

    /// <summary>Everyone's names, and Amara's family: postal code M4M 1H1, Zuri (born 14 Nov 2019) and Kofi (3 Feb 2023).</summary>
    public static void AddPeople(GiddyDbContext db)
    {
        foreach (var parent in new[] { TestParent.Amara, TestParent.Kemi, TestParent.Dev, TestParent.Stranger })
        {
            db.Set<Parent>().Add(new Parent(parent.Id, parent.Name, parent.Email));
        }

        var family = new Family(TestParent.Amara.Id, "M4M 1H1");
        family.AddChild(new Child(Zuri, "Zuri", new LocalDate(2019, 11, 14)));
        family.AddChild(new Child(Kofi, "Kofi", new LocalDate(2023, 2, 3)));
        db.Set<Family>().Add(family);
    }

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
            800,
            Zuri);
        party.NoteAllergy("peanut");
        party.Share(TestParent.Kemi.Id, PartyRole.CoPlanner);
        party.Share(TestParent.Dev.Id, PartyRole.Viewer);
        return party;
    }

    /// <summary>Five families on Zuri's list: Aisha's parent has no mobile and Ava's has no email.</summary>
    public static IReadOnlyList<Guest> GuestsFor(Party party) =>
    [
        new(Guid.NewGuid(), party.Id, "Maya Chen", "Lily Chen", "lily.chen@example.com", "416-555-0177"),
        new(Guid.NewGuid(), party.Id, "Arjun Patel", "Priya Patel", "priya.patel@example.com", "416-555-0123"),
        new(Guid.NewGuid(), party.Id, "Leo Rossi", "Marco Rossi", "marco.rossi@example.com", "647-555-0101"),
        new(Guid.NewGuid(), party.Id, "Aisha Mohamed", "Hodan Mohamed", "hodan.mohamed@example.com", null),
        new(Guid.NewGuid(), party.Id, "Ava Wilson", "Jordan Wilson", null, "416-555-0199"),
    ];

    public static Party StrangersParty() => Party.Plan(
        Guid.NewGuid(),
        "Noah’s Space Party",
        new LocalDate(2026, 12, 5),
        new LocalTime(10, 0),
        new LocalTime(12, 0),
        TestParent.Stranger.Id);
}

public static class PartyTestExtensions
{
    /// <summary>Applies a five-item plan with a ten-task checklist, as Giddy's plan does.</summary>
    public static Party WithPlan(this Party party, int doneTasks = 0, int confirmedBookings = 0)
    {
        string[] categories = ["Venue", "Entertainer", "Cake", "Food", "Loot bags"];
        string[] names = ["Dino Den Play Café", "Professor Fizz’s Volcano Lab", "Sweet Rex Bakery", "Pizza Nonna", "Mini fossil dig kits"];
        decimal[] prices = [340, 195, 85, 110, 48];
        var bookings = categories.Select((c, i) => new BookingToDo(c, names[i], prices[i], null, i < confirmedBookings ? BookingStatus.Confirmed : BookingStatus.ToBook));
        var tasks = ChecklistGenerator.For(party.Date, new LocalDate(2026, 10, 1)).Select((t, i) => t with { Done = i < doneTasks });
        party.ApplyPlan("Dino Dig", bookings, tasks);
        return party;
    }
}
