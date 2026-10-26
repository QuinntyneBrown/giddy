using FluentValidation;
using Giddy.Application.Bookings;

namespace Giddy.Application.Rsvps.SubmitRsvp;

public sealed class SubmitRsvpValidator : AbstractValidator<SubmitRsvpCommand>
{
    public SubmitRsvpValidator()
    {
        RuleFor(c => c.ParentName).NotEmpty().WithMessage("Add your name so the family knows who replied.").MaximumLength(80);
        RuleFor(c => c.Mobile)
            .Must(MobileNumber.IsValid).When(c => !string.IsNullOrWhiteSpace(c.Mobile))
            .WithMessage("Enter a 10-digit mobile number, like 416-555-0177, or leave it blank.");
        RuleFor(c => c.Allergies).MaximumLength(200);
        RuleFor(c => c.Note).MaximumLength(500);
        RuleFor(c => c.Siblings).InclusiveBetween(0, 10);
    }
}
