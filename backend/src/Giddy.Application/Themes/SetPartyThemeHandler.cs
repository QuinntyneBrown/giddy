using Giddy.Application.Common;
using Giddy.Domain.Catalogue;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Giddy.Application.Themes;

/// <summary>Sets or clears the party's theme and returns the previous one so Undo can restore it.</summary>
public sealed class SetPartyThemeHandler(IGiddyDbContext db) : IRequestHandler<SetPartyThemeCommand, ThemeChange>
{
    public async Task<ThemeChange> Handle(SetPartyThemeCommand request, CancellationToken cancellationToken)
    {
        var party = await db.Parties.SingleAsync(p => p.Id == request.PartyId, cancellationToken);
        string? name = null;
        if (request.ThemeId is { } themeId)
        {
            name = await db.CatalogueItems.Where(i => i.Id == themeId && i.Category == CatalogueCategory.Theme).Select(i => i.Name).SingleOrDefaultAsync(cancellationToken)
                ?? throw new NotFoundException("Theme not found.");
        }

        PreviousTheme? previous = null;
        if (party.Theme is { } old)
        {
            var oldId = await db.CatalogueItems.Where(i => i.Category == CatalogueCategory.Theme && i.Name == old).Select(i => (Guid?)i.Id).FirstOrDefaultAsync(cancellationToken);
            previous = new PreviousTheme(oldId, old);
        }

        party.ChooseTheme(name);
        await db.SaveChangesAsync(cancellationToken);
        return new ThemeChange(party.Theme, previous);
    }
}
