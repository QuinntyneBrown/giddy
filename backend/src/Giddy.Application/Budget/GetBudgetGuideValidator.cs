using FluentValidation;

namespace Giddy.Application.Budget;

public sealed class GetBudgetGuideValidator : AbstractValidator<GetBudgetGuideQuery>
{
    public GetBudgetGuideValidator() =>
        RuleFor(q => q.Guests).InclusiveBetween(1, 60).WithMessage("Enter between 1 and 60 kids.");
}
