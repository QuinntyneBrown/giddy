using Giddy.Application.Common;
using Giddy.Application.Guests;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Giddy.Application.RunSheets;

public sealed class DraftRunSheetHandler(IGiddyDbContext db, RunSheetReader reader) : IRequestHandler<DraftRunSheetCommand, RunSheetView>
{
    public async Task<RunSheetView> Handle(DraftRunSheetCommand request, CancellationToken cancellationToken)
    {
        var party = await db.Parties.SingleAsync(p => p.Id == request.PartyId, cancellationToken);
        if (party.RunSheet.Count > 0)
        {
            throw new ConflictException("This party already has a run sheet.");
        }

        if (party.BookingsToDo.Count == 0)
        {
            throw new ConflictException("Add bookings to the plan first, then Giddy can draft the run sheet.");
        }

        var owner = await db.Parents.Where(p => p.Id == party.OwnerId).Select(p => p.Name).SingleOrDefaultAsync(cancellationToken) ?? "You";
        var guests = await db.Guests.Where(g => g.PartyId == party.Id).ToListAsync(cancellationToken);
        party.DraftRunSheet(RunSheetDrafter.Draft(party, owner.Split(' ')[0], await reader.ItemsAsync(party, cancellationToken), AllergyLists.For(guests)));
        await db.SaveChangesAsync(cancellationToken);
        return await reader.ViewAsync(party, cancellationToken);
    }
}
