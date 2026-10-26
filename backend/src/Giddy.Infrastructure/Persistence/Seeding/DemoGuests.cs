using Giddy.Domain.Guests;

namespace Giddy.Infrastructure.Persistence.Seeding;

/// <summary>Zuri's guest list for the demo: sixteen families, not yet invited. Two have no mobile number.</summary>
public static class DemoGuests
{
    private static readonly (string Child, string Parent, string? Mobile)[] Families =
    [
        ("Maya Chen", "Lily Chen", "416-555-0177"),
        ("Arjun Patel", "Priya Patel", "416-555-0123"),
        ("Leo Rossi", "Marco Rossi", "647-555-0101"),
        ("Sofia Haddad", "Rania Haddad", "416-555-0145"),
        ("Ethan Kim", "Grace Kim", "647-555-0166"),
        ("Noah Tremblay", "Julie Tremblay", "416-555-0110"),
        ("Aisha Mohamed", "Hodan Mohamed", null),
        ("Liam O’Brien", "Siobhan O’Brien", "416-555-0158"),
        ("Hana Sato", "Kenji Sato", "647-555-0132"),
        ("Mateo García", "Lucía García", "416-555-0184"),
        ("Olivia Nguyen", "Thu Nguyen", "416-555-0119"),
        ("Benjamin Cohen", "Rachel Cohen", "647-555-0171"),
        ("Amelia Singh", "Harpreet Singh", "416-555-0137"),
        ("Lucas Martin", "Chloé Martin", "416-555-0192"),
        ("Ava Wilson", "Jordan Wilson", null),
        ("Zara Ali", "Fatima Ali", "647-555-0148"),
    ];

    public static IEnumerable<Guest> For(Guid partyId) =>
        Families.Select((f, i) => new Guest(
            Guid.Parse($"e1000000-0000-4000-8000-{i + 1:D12}"),
            partyId,
            f.Child,
            f.Parent,
            $"{f.Parent.Split(' ')[0].ToLowerInvariant()}.{f.Parent.Split(' ')[^1].ToLowerInvariant().Replace("’", string.Empty)}@example.com",
            f.Mobile));
}
