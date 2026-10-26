using FluentValidation;

namespace Giddy.Application.Accounts.Reset;

public sealed class ResetPasswordValidator : AbstractValidator<ResetPasswordCommand>
{
    public ResetPasswordValidator(IBreachedPasswords breached)
    {
        RuleFor(c => c.Password).Must(PasswordRules.IsStrong).WithMessage(PasswordRules.WeakMessage)
            .DependentRules(() => RuleFor(c => c.Password)
                .MustAsync(async (password, cancel) => !await breached.IsBreachedAsync(password, cancel))
                .WithMessage(PasswordRules.BreachedMessage));
        RuleFor(c => c.Confirm).Equal(c => c.Password).WithMessage("Passwords don’t match");
    }
}
