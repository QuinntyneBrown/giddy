using FluentValidation;
using Giddy.Application.Bookings;
using NodaTime.Text;

namespace Giddy.Application.Vendors.Quotes;

public sealed class RequestQuoteValidator : AbstractValidator<RequestQuoteCommand>
{
    public RequestQuoteValidator()
    {
        RuleFor(c => c.Date).Must(d => LocalDatePattern.Iso.Parse(d ?? string.Empty).Success).WithMessage("Choose a date.");
        RuleFor(c => c.Start).Must(s => BookingFormats.Time.Parse(s ?? string.Empty).Success).WithMessage("Choose a start time.");
        RuleFor(c => c.Kids).InclusiveBetween(1, 60).WithMessage("Enter between 1 and 60 kids.");
        RuleFor(c => c.Location).NotEmpty().WithMessage("Say where the party is.").MaximumLength(200);
        RuleFor(c => c.Message).MaximumLength(500).WithMessage("Keep the message to 500 characters.");
    }
}
