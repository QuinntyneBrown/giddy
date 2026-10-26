using FluentValidation;

namespace Giddy.Application.Vendors.Search;

public sealed class SearchVendorsValidator : AbstractValidator<SearchVendorsQuery>
{
    public SearchVendorsValidator()
    {
        RuleFor(q => q.Category).Must(c => VendorCategories.All.ContainsKey(c ?? string.Empty)).WithMessage("Choose entertainers, activities, food or rentals.");
        RuleFor(q => q.MaxPrice).GreaterThan(0).When(q => q.MaxPrice is not null);
    }
}
