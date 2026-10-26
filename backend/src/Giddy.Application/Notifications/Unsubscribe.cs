using Giddy.Application.Common;
using Giddy.Domain.Notifications;
using Microsoft.EntityFrameworkCore;

namespace Giddy.Application.Notifications;

/// <summary>
/// The one-click unsubscribe link in party-ideas emails: a protected token naming the parent, so it
/// works without signing in and can't be guessed.
/// </summary>
public sealed class Unsubscribe(IGiddyDbContext db, ISecretProtector protector, IWebLinks links)
{
    private const string Purpose = "unsubscribe:";

    public string LinkFor(Guid parentId) =>
        links.To($"/api/unsubscribe?token={Uri.EscapeDataString(protector.Protect(Purpose + parentId))}");

    /// <summary>Turns party ideas off; false when the token isn't one of Giddy's.</summary>
    public async Task<bool> ApplyAsync(string token, CancellationToken cancellationToken)
    {
        string value;
        try
        {
            value = protector.Unprotect(token);
        }
        catch (Exception exception) when (exception is not OperationCanceledException)
        {
            return false;
        }

        if (!value.StartsWith(Purpose, StringComparison.Ordinal) || !Guid.TryParse(value[Purpose.Length..], out var parentId)
            || await db.Parents.SingleOrDefaultAsync(p => p.Id == parentId, cancellationToken) is not { } parent)
        {
            return false;
        }

        parent.SetChannels(NotificationCategory.Ideas, email: false, text: false, push: false);
        await db.SaveChangesAsync(cancellationToken);
        return true;
    }
}
