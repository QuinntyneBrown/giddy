using FluentValidation;
using Giddy.Domain.Invitations;
using NodaTime.Text;

namespace Giddy.Application.Invitations.SaveInvitation;

public sealed class SaveInvitationValidator : AbstractValidator<SaveInvitationCommand>
{
    public SaveInvitationValidator()
    {
        RuleFor(c => c.Design).Must(d => InvitationDesigns.All.Contains(d)).WithMessage("Choose a design.");
        RuleFor(c => c.Headline).NotEmpty().WithMessage("Add a headline.")
            .MaximumLength(Invitation.HeadlineMaxLength).WithMessage($"Keep the headline to {Invitation.HeadlineMaxLength} characters.");
        RuleFor(c => c.Message).NotEmpty().WithMessage("Add a message.")
            .MaximumLength(Invitation.MessageMaxLength).WithMessage($"Keep the message to {Invitation.MessageMaxLength} characters.");
        RuleFor(c => c.RsvpBy).Must(d => LocalDatePattern.Iso.Parse(d ?? string.Empty).Success).WithMessage("Choose an RSVP-by date.");
        RuleFor(c => c.ByEmail).Must((c, byEmail) => byEmail || c.ByText).WithMessage("Choose at least one way to send.");
    }
}
