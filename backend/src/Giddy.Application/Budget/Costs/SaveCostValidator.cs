using FluentValidation;

namespace Giddy.Application.Budget.Costs;

public sealed class SaveCostValidator : AbstractValidator<SaveCostCommand>
{
    private const string AmountMessage = "Enter an amount like 35 or 35.50";

    public SaveCostValidator()
    {
        RuleFor(c => c.Description).NotEmpty().WithMessage("Say what the cost is for.").MaximumLength(80);
        RuleFor(c => c.Category).Must(c => CostCategories.All.Contains(c)).WithMessage("Choose a category.");
        RuleFor(c => c.Amount)
            .Must(a => a > 0 && a <= 100_000 && decimal.Round(a, 2) == a)
            .WithMessage(AmountMessage);
    }
}
