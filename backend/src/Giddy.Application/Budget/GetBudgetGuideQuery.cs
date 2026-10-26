using MediatR;

namespace Giddy.Application.Budget;

public sealed record GetBudgetGuideQuery(int Guests) : IRequest<BudgetRange>;
