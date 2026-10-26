using FluentValidation;
using NodaTime.Text;

namespace Giddy.Application.Bookings.BookVenue;

public sealed class BookVenueValidator : AbstractValidator<BookVenueCommand>
{
    public BookVenueValidator()
    {
        RuleFor(c => c.Date).Must(d => LocalDatePattern.Iso.Parse(d ?? string.Empty).Success).WithMessage("Choose a date.");
        RuleFor(c => c.Start).Must(s => BookingFormats.Time.Parse(s ?? string.Empty).Success).WithMessage("Choose a start time.");
        RuleFor(c => c.BookingName).NotEmpty().WithMessage("Add a name for the booking.").MaximumLength(80);
        RuleFor(c => c.Mobile).NotEmpty().WithMessage("Add a mobile number so the venue can reach you on the day.");
        RuleFor(c => c.Mobile)
            .Must(MobileNumber.IsValid).When(c => !string.IsNullOrWhiteSpace(c.Mobile))
            .WithMessage("Enter a 10-digit mobile number, like 416-555-0188.");
        RuleFor(c => c.Child).NotEmpty().WithMessage("Add the birthday child.").MaximumLength(80);
        RuleFor(c => c.Notes).MaximumLength(500);
        RuleFor(c => c.Payment).NotNull().WithMessage("Choose how to pay the deposit.");
        RuleFor(c => c.Payment)
            .Must(p => !string.IsNullOrWhiteSpace(p.Token) || p.SavedCardId is not null)
            .When(c => c.Payment is not null)
            .WithMessage("Choose how to pay the deposit.");
    }
}
