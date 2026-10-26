using FluentValidation;
using Giddy.Domain.Places;

namespace Giddy.Application.Places.CheckServiceArea;

public sealed class CheckServiceAreaValidator : AbstractValidator<CheckServiceAreaQuery>
{
    public CheckServiceAreaValidator()
    {
        RuleFor(q => q.PostalCode)
            .Must(code => code.Length <= 10 && Giddy.Domain.Places.PostalCode.TryParse(code, out _))
            .WithMessage("Enter a Canadian postal code, like M4M 1H1.");
    }
}
