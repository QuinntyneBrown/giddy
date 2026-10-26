using FluentValidation;
using NodaTime.Text;

namespace Giddy.Application.Venues.Detail;

public sealed class GetVenueValidator : AbstractValidator<GetVenueQuery>
{
    public GetVenueValidator() =>
        RuleFor(q => q.Date).Must(d => LocalDatePattern.Iso.Parse(d ?? string.Empty).Success).WithMessage("Choose a date.");
}
