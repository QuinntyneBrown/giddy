using Giddy.Application.Common;
using Giddy.Domain.Parties;
using Giddy.Domain.Places;
using Microsoft.EntityFrameworkCore;

namespace Giddy.Application.Venues;

/// <summary>
/// Resolves where to search from: the party's area (only for its members), a postal code, or the
/// family's postal code.
/// </summary>
public sealed class VenueOrigins(IGiddyDbContext db, ICurrentParent parent)
{
    public async Task<VenueOrigin?> ResolveAsync(Guid? partyId, string? postalCode, CancellationToken cancellationToken)
    {
        if (partyId is { } id)
        {
            var party = await db.Parties.SingleOrDefaultAsync(p => p.Id == id && p.Members.Any(m => m.ParentId == parent.Id), cancellationToken)
                ?? throw new NotFoundException("Party not found.");
            if (party.Area is { } area)
            {
                return new VenueOrigin(area, area.InServiceArea, party);
            }
        }

        var code = postalCode;
        if (string.IsNullOrWhiteSpace(code))
        {
            code = (await db.Families.SingleOrDefaultAsync(f => f.Id == parent.Id, cancellationToken))?.PostalCode;
        }

        if (!PostalCode.TryParse(code, out var parsed))
        {
            return null;
        }

        var resolved = GtaAreas.Resolve(parsed!);
        return new VenueOrigin(resolved, resolved.InServiceArea, null);
    }
}
