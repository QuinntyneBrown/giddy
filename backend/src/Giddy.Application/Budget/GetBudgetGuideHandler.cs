using Giddy.Domain.Budget;
using MediatR;

namespace Giddy.Application.Budget;

public sealed class GetBudgetGuideHandler : IRequestHandler<GetBudgetGuideQuery, BudgetRange>
{
    public Task<BudgetRange> Handle(GetBudgetGuideQuery request, CancellationToken cancellationToken)
    {
        var (low, high) = BudgetGuide.TypicalFor(request.Guests);
        return Task.FromResult(new BudgetRange(request.Guests, low, high));
    }
}
