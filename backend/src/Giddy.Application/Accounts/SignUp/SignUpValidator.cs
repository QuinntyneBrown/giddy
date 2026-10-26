using FluentValidation;
using Giddy.Domain.Places;

namespace Giddy.Application.Accounts.SignUp;

public sealed class SignUpValidator : AbstractValidator<SignUpCommand>
{
    public const string EmailMessage = "Enter an email address like name@example.com";

    public SignUpValidator(IBreachedPasswords breached)
    {
        RuleFor(c => c.FirstName).Must(n => !string.IsNullOrWhiteSpace(n)).WithMessage("Enter your first name");
        RuleFor(c => c.FirstName).MaximumLength(60).WithMessage("Keep your first name under 60 characters");
        RuleFor(c => c.Email).Cascade(CascadeMode.Stop)
            .NotEmpty().WithMessage(EmailMessage)
            .EmailAddress().WithMessage(EmailMessage)
            .MaximumLength(254).WithMessage(EmailMessage);
        RuleFor(c => c.Password).Must(PasswordRules.IsStrong).WithMessage(PasswordRules.WeakMessage)
            .DependentRules(() => RuleFor(c => c.Password)
                .MustAsync(async (password, cancel) => !await breached.IsBreachedAsync(password, cancel))
                .WithMessage(PasswordRules.BreachedMessage));
        RuleFor(c => c.PostalCode)
            .Must(code => PostalCode.TryParse(code, out var parsed) && GtaServiceArea.RegionOf(parsed!) is not null)
            .WithMessage("Enter a postal code in the GTA, like M4M 1H1");
    }
}
