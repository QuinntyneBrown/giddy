using FluentValidation;
using Giddy.Domain.Guests;
using Giddy.Domain.Places;

namespace Giddy.Application.Settings;

public sealed class UpdateProfileValidator : AbstractValidator<UpdateProfileCommand>
{
    public UpdateProfileValidator()
    {
        RuleFor(c => c.FirstName).Must(n => !string.IsNullOrWhiteSpace(n)).WithMessage("Enter your first name");
        RuleFor(c => c.FirstName).MaximumLength(60);
        RuleFor(c => c.LastName).MaximumLength(60);
        RuleFor(c => c.Mobile)
            .Must(m => string.IsNullOrWhiteSpace(m) || CanadianMobile.IsValid(m))
            .WithMessage("Enter a Canadian mobile number, like 416-555-0131, or leave it blank");
        RuleFor(c => c.PostalCode)
            .Must(p => string.IsNullOrWhiteSpace(p) || PostalCode.TryParse(p, out _))
            .WithMessage("Enter a Canadian postal code, like M4M 1H1");
    }
}
