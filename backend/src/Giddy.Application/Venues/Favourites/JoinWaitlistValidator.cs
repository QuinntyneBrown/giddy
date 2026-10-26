using FluentValidation;
using NodaTime.Text;

namespace Giddy.Application.Venues.Favourites;

public sealed class JoinWaitlistValidator : AbstractValidator<JoinWaitlistCommand>
{
    public JoinWaitlistValidator() =>
        RuleFor(c => c.Date).Must(d => LocalDatePattern.Iso.Parse(d ?? string.Empty).Success).WithMessage("Choose a date.");
}
