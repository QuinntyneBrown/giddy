using FluentValidation;
using Giddy.Domain.Calendar;
using Giddy.Domain.Families;
using NodaTime.Text;

namespace Giddy.Application.Families.Children;

public sealed class SaveChildValidator : AbstractValidator<SaveChildCommand>
{
    public SaveChildValidator(TorontoCalendar calendar)
    {
        RuleFor(c => c.FirstName).Must(n => !string.IsNullOrWhiteSpace(n)).WithMessage("Enter your child’s first name");
        RuleFor(c => c.FirstName).MaximumLength(40).WithMessage("Keep the name under 40 characters");
        RuleFor(c => c.Birthday)
            .Must(b => LocalDatePattern.Iso.Parse(b ?? string.Empty) is { Success: true } parsed && parsed.Value < calendar.Today && parsed.Value.Year > 1990)
            .WithMessage("Enter a birthday in the past, like 14 Nov 2019");
        RuleFor(c => c.Interests).Must(i => i.Count <= Interests.MaxPerChild).WithMessage("Pick up to 5");
        RuleForEach(c => c.Interests).Must(Interests.IsKnown).WithMessage("Choose interests from the list");
        RuleFor(c => c.Allergies).MaximumLength(200).WithMessage("Keep allergies under 200 characters");
    }
}
