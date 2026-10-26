using Giddy.Application.Common;
using Giddy.Domain.Parents;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Giddy.Application.Parents;

public sealed class RecordParentHandler(IGiddyDbContext db, ICurrentParent parent) : IRequestHandler<RecordParentCommand, Account>
{
    public async Task<Account> Handle(RecordParentCommand request, CancellationToken cancellationToken)
    {
        var existing = await db.Parents.SingleOrDefaultAsync(p => p.Id == parent.Id, cancellationToken);
        if (existing is null)
        {
            db.Parents.Add(new Parent(parent.Id, parent.Name, parent.Email));
        }
        else if (existing.Name != parent.Name || existing.Email != parent.Email)
        {
            existing.Update(parent.Name, parent.Email);
        }
        else
        {
            return new Account(existing.EmailBounced);
        }

        await db.SaveChangesAsync(cancellationToken);
        return new Account(existing?.EmailBounced ?? false);
    }
}
