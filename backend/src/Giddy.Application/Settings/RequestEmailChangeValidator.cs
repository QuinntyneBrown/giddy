using FluentValidation;
using Giddy.Application.Accounts.SignUp;

namespace Giddy.Application.Settings;

public sealed class RequestEmailChangeValidator : AbstractValidator<RequestEmailChangeCommand>
{
    public RequestEmailChangeValidator() =>
        RuleFor(c => c.Email).Cascade(CascadeMode.Stop)
            .NotEmpty().WithMessage(SignUpValidator.EmailMessage)
            .EmailAddress().WithMessage(SignUpValidator.EmailMessage);
}
