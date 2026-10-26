using FluentValidation;

namespace Giddy.Application.Wrapping;

public sealed class RateProviderValidator : AbstractValidator<RateProviderCommand>
{
    public RateProviderValidator()
    {
        RuleFor(c => c.Stars).InclusiveBetween(1, 5).WithMessage("Choose 1 to 5 stars");
        RuleFor(c => c.Review).MaximumLength(500).WithMessage("Keep the review to 500 characters");
    }
}
