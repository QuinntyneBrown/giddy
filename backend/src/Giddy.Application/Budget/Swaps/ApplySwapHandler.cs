using Giddy.Application.Budget.Track;
using Giddy.Application.Common;
using Giddy.Domain.Catalogue;
using Giddy.Domain.Parties;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Giddy.Application.Budget.Swaps;

/// <summary>Replaces an item not yet booked with the cheaper one the parent confirmed.</summary>
public sealed class ApplySwapHandler(IGiddyDbContext db, BudgetProjection projection) : IRequestHandler<ApplySwapCommand, BudgetView>
{
    public async Task<BudgetView> Handle(ApplySwapCommand request, CancellationToken cancellationToken)
    {
        var party = await db.Parties.SingleAsync(p => p.Id == request.PartyId, cancellationToken);
        var current = party.BookingsToDo.SingleOrDefault(b => b.Category == request.Category)
            ?? throw new NotFoundException("Nothing in the plan for that category.");
        if (current.Status == BookingStatus.Confirmed)
        {
            throw new ConflictException($"{current.Name} is already booked, so it can’t be swapped here.");
        }

        var replacement = await db.CatalogueItems.SingleOrDefaultAsync(i => i.Id == request.ReplacementId && i.Category != CatalogueCategory.Theme, cancellationToken)
            ?? throw new NotFoundException("Vendor not found.");
        party.SwapItem(request.Category, replacement.Id, replacement.Name, replacement.Price);
        await db.SaveChangesAsync(cancellationToken);
        return await projection.ViewAsync(party, cancellationToken);
    }
}
