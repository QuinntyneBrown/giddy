using Giddy.Domain.Disruptions;
using NodaTime;

namespace Giddy.Infrastructure.Persistence.Seeding;

/// <summary>Transit and city notices for the demo, until the notice feeds are connected.</summary>
public static class DemoDisruptions
{
    public static readonly Guid QueenStreetClosure = Guid.Parse("d1000000-0000-4000-8000-000000000001");

    public static IEnumerable<DisruptionNotice> Notices()
    {
        yield return new DisruptionNotice(
            QueenStreetClosure,
            "Sat 14 Nov is a TTC weekend closure on Queen St E",
            "The 501 streetcar is replaced by buses between Broadview and Neville Park. Tell guests to leave extra time.",
            43.6680,
            -79.3300,
            3,
            new LocalDate(2026, 11, 14),
            new LocalDate(2026, 11, 15));
    }
}
