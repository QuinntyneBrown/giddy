using Giddy.Application.Budget.Track;
using Giddy.Application.Common;
using Giddy.Domain.Parties;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Giddy.Application.Budget.Costs;

/// <summary>Typical tax-inclusive GTA costs: a venue, an entertainer, a cake, food and loot bags per child.</summary>
public sealed class EstimateBudgetHandler(IGiddyDbContext db, BudgetProjection projection) : IRequestHandler<EstimateBudgetCommand, BudgetView>
{
    public async Task<BudgetView> Handle(EstimateBudgetCommand request, CancellationToken cancellationToken)
    {
        var party = await db.Parties.SingleAsync(p => p.Id == request.PartyId, cancellationToken);
        if (party.BookingsToDo.Count > 0 || party.Expenses.Count > 0)
        {
            throw new ConflictException("This party already has costs to work from.");
        }

        var kids = party.GuestCount ?? 12;
        party.EstimateFromScratch(
        [
            new BookingToDo("Venue", "Venue (estimate)", 300, null),
            new BookingToDo("Entertainer", "Entertainer (estimate)", 200, null),
            new BookingToDo("Cake", "Cake (estimate)", 80, null),
            new BookingToDo("Food", "Food (estimate)", 7 * kids, null),
            new BookingToDo("Loot bags", "Loot bags (estimate)", 4 * kids, null),
        ]);
        await db.SaveChangesAsync(cancellationToken);
        return await projection.ViewAsync(party, cancellationToken);
    }
}
