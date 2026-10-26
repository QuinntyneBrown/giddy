using FluentValidation;
using NodaTime.Text;

namespace Giddy.Application.Venues.Search;

public sealed class SearchVenuesValidator : AbstractValidator<SearchVenuesQuery>
{
    public SearchVenuesValidator()
    {
        RuleFor(q => q.Date).Must(d => LocalDatePattern.Iso.Parse(d ?? string.Empty).Success).WithMessage("Choose a date.");
        RuleFor(q => q.Guests).InclusiveBetween(1, 60).WithMessage("Enter how many kids, from 1 to 60.");
        RuleFor(q => q.RadiusKm).InclusiveBetween(1, 60).WithMessage("Choose how far to look.");
        RuleFor(q => q.MaxPrice).InclusiveBetween(0, 20000).When(q => q.MaxPrice is not null).WithMessage("Enter a price in dollars.");
        RuleFor(q => q.Sort).Must(s => VenueSort.All.Contains(s)).WithMessage("Choose a sort order.");
    }
}
