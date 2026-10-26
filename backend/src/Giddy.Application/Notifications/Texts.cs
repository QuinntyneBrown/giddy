using Giddy.Application.Common;
using Giddy.Domain.Notifications;
using Microsoft.EntityFrameworkCore;

namespace Giddy.Application.Notifications;

/// <summary>
/// Every text Giddy sends: it says it's from Giddy, says how to stop, and never goes to a number
/// that replied STOP (CASL).
/// </summary>
public sealed class Texts(IGiddyDbContext db, ISmsSender sms)
{
    /// <summary>Sends the text unless the number opted out; true when it was sent.</summary>
    public async Task<bool> SendAsync(string to, string message, CancellationToken cancellationToken)
    {
        var number = SmsOptOut.Normalize(to);
        if (await db.SmsOptOuts.AnyAsync(o => o.Number == number, cancellationToken))
        {
            return false;
        }

        await sms.SendAsync(new TextMessage(to, $"Giddy: {message} Reply STOP to opt out"), cancellationToken);
        return true;
    }
}
