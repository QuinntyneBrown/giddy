using FluentValidation;
using Giddy.Domain.Guests;

namespace Giddy.Application.Guests.AddGuest;

public sealed class AddGuestValidator : AbstractValidator<AddGuestCommand>
{
    public AddGuestValidator()
    {
        RuleFor(c => c.ChildName).NotEmpty().WithMessage("Add the child’s name.").MaximumLength(80);
        RuleFor(c => c.ParentName).NotEmpty().WithMessage("Add the parent’s name.").MaximumLength(80);
        RuleFor(c => c.Email).NotEmpty().WithMessage("Add the parent’s email.");
        RuleFor(c => c.Email).EmailAddress().When(c => !string.IsNullOrWhiteSpace(c.Email))
            .WithMessage("Enter an email like name@example.com.").MaximumLength(254);
        RuleFor(c => c.Mobile).Must(CanadianMobile.IsValid).When(c => !string.IsNullOrWhiteSpace(c.Mobile))
            .WithMessage("Enter a Canadian mobile number, like 416-555-0131, or leave it blank.");
    }
}
