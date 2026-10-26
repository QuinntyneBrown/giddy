using Giddy.Domain.Parents;
using Giddy.Infrastructure.Persistence;
using Microsoft.AspNetCore.Identity;

namespace Giddy.Api.IntegrationTests.Support;

/// <summary>Verified accounts with a known password, for sign-in tests.</summary>
public static class Accounts
{
    public const string Password = "dino-dig-2026";

    public static Parent Amara(GiddyDbContext db, string password = Password)
    {
        var amara = new Parent(TestParent.Amara.Id, "Amara", TestParent.Amara.Email);
        amara.SetPassword(new PasswordHasher<Parent>().HashPassword(amara, password));
        amara.ConfirmEmail(NodaTime.Instant.FromUtc(2026, 10, 1, 12, 0));
        db.Parents.Add(amara);
        db.Families.Add(new Giddy.Domain.Families.Family(amara.Id, "M4M 1H1"));
        return amara;
    }
}
