using FluentValidation;
using Giddy.Application.Accounts.SignUp;
using Giddy.Domain.Parties;

namespace Giddy.Application.Sharing;

public sealed class InviteMemberValidator : AbstractValidator<InviteMemberCommand>
{
    public InviteMemberValidator()
    {
        RuleFor(c => c.Email).Cascade(CascadeMode.Stop)
            .NotEmpty().WithMessage(SignUpValidator.EmailMessage)
            .EmailAddress().WithMessage(SignUpValidator.EmailMessage);
        RuleFor(c => c.Role).Must(r => r is PartyRole.CoPlanner or PartyRole.Viewer).WithMessage("Choose Edit everything or View only");
    }
}
