using FluentValidation;
using NodaTime.Text;

namespace Giddy.Application.Venues.Compare;

public sealed class CompareVenuesValidator : AbstractValidator<CompareVenuesQuery>
{
    public CompareVenuesValidator()
    {
        RuleFor(q => q.VenueIds).Must(ids => ids.Distinct().Count() is 2 or 3).WithMessage("Pick 2 or 3 venues to compare.");
        RuleFor(q => q.Date).Must(d => LocalDatePattern.Iso.Parse(d ?? string.Empty).Success).WithMessage("Choose a date.");
    }
}
