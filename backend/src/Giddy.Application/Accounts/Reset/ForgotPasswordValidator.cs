using FluentValidation;
using Giddy.Application.Accounts.SignUp;

namespace Giddy.Application.Accounts.Reset;

public sealed class ForgotPasswordValidator : AbstractValidator<ForgotPasswordCommand>
{
    public ForgotPasswordValidator() =>
        RuleFor(c => c.Email).Cascade(CascadeMode.Stop)
            .NotEmpty().WithMessage(SignUpValidator.EmailMessage)
            .EmailAddress().WithMessage(SignUpValidator.EmailMessage);
}
