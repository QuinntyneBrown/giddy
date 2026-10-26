using FluentValidation;

namespace Giddy.Application.Wrapping;

public sealed class SaveThankYouValidator : AbstractValidator<SaveThankYouCommand>
{
    public SaveThankYouValidator()
    {
        RuleFor(c => c.Message).Must(m => m is null || !string.IsNullOrWhiteSpace(m)).WithMessage("Write a note, or keep Giddy’s draft");
        RuleFor(c => c.Message).MaximumLength(1000).WithMessage("Keep the note to 1,000 characters");
        RuleFor(c => c.Gift).MaximumLength(120).WithMessage("Keep the gift to 120 characters");
    }
}
