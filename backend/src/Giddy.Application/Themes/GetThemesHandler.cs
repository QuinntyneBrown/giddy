using Giddy.Application.Common;
using Giddy.Domain.Catalogue;
using Giddy.Domain.Parties;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Giddy.Application.Themes;

/// <summary>Themes for the party's child: their age by default, with interests Giddy remembers tagged.</summary>
public sealed class GetThemesHandler(IGiddyDbContext db, ICurrentParent parent) : IRequestHandler<GetThemesQuery, ThemeList>
{
    public async Task<ThemeList> Handle(GetThemesQuery request, CancellationToken cancellationToken)
    {
        Party? party = null;
        if (request.PartyId is { } partyId)
        {
            party = await db.Parties.SingleOrDefaultAsync(p => p.Id == partyId && p.Members.Any(m => m.ParentId == parent.Id), cancellationToken)
                ?? throw new NotFoundException("Party not found.");
        }

        var themes = (await db.CatalogueItems.Where(i => i.Category == CatalogueCategory.Theme).ToListAsync(cancellationToken))
            .Where(t => t.ThemeInfo is not null)
            .OrderBy(t => t.Name)
            .ToList();
        var child = party is { ChildName: { } name, TurningAge: { } age } ? new ThemeChild(name, age) : null;
        var forChild = child is not null && request.ForChild != false;
        var (bandMin, bandMax) = Band(request.AgeBand);
        var owner = party?.Members.Single(m => m.Role == PartyRole.Owner).ParentId ?? parent.Id;
        var interests = (await db.Memories.Where(m => m.FamilyId == owner).Select(m => m.Text).ToListAsync(cancellationToken))
            .Select(t => t.ToLowerInvariant()).ToList();

        var results = themes
            .Where(t => !forChild || (t.ThemeInfo!.MinAge <= child!.Age && child.Age <= t.ThemeInfo.MaxAge))
            .Where(t => bandMin is null || (t.ThemeInfo!.MinAge <= bandMax && t.ThemeInfo.MaxAge >= bandMin))
            .Where(t => !request.Outdoor || t.ThemeInfo!.Outdoor)
            .Where(t => !request.BudgetFriendly || t.ThemeInfo!.BudgetFriendly)
            .Select(t => new ThemeView(
                t.Id,
                t.Name,
                t.ThemeInfo!.Emoji,
                t.Description,
                t.ThemeInfo.MinAge,
                t.ThemeInfo.MaxAge,
                t.ThemeInfo.Outdoor,
                t.ThemeInfo.BudgetFriendly,
                t.Themes.Any(tag => interests.Any(i => i.Contains(tag, StringComparison.OrdinalIgnoreCase))),
                string.Equals(party?.Theme, t.Name, StringComparison.OrdinalIgnoreCase)))
            .ToList();
        return new ThemeList(themes.Count, child, forChild, party?.Theme, results);
    }

    private static (int? Min, int? Max) Band(string? band)
    {
        var parts = (band ?? string.Empty).Split('-');
        return parts.Length == 2 && int.TryParse(parts[0], out var min) && int.TryParse(parts[1], out var max) ? (min, max) : (null, null);
    }
}
