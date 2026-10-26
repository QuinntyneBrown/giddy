using Giddy.Application.Common;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Giddy.Application.Payments;

public sealed class GetPaymentMethodsHandler(IGiddyDbContext db, ICurrentParent parent) : IRequestHandler<GetPaymentMethodsQuery, IReadOnlyList<SavedCardView>>
{
    public async Task<IReadOnlyList<SavedCardView>> Handle(GetPaymentMethodsQuery request, CancellationToken cancellationToken) =>
        await db.SavedCards
            .Where(c => c.ParentId == parent.Id)
            .OrderByDescending(c => c.CreatedAt)
            .Select(c => new SavedCardView(c.Id, c.Brand, c.Last4))
            .ToListAsync(cancellationToken);
}
