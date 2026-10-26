using FluentValidation;
using Giddy.Application.Common;
using Giddy.Domain.Calendar;
using Giddy.Domain.Places;
using Microsoft.EntityFrameworkCore;
using NodaTime.Text;

namespace Giddy.Application.Parties.CreateParty;

public sealed class CreatePartyValidator : AbstractValidator<CreatePartyCommand>
{
    public const int MaxGuests = 60;

    public CreatePartyValidator(TorontoCalendar calendar, IGiddyDbContext db, ICurrentParent parent)
    {
        RuleFor(c => c.Date)
            .Must(date => LocalDatePattern.Iso.Parse(date ?? string.Empty) is { Success: true } parsed && parsed.Value > calendar.Today)
            .WithMessage("Choose a date from tomorrow onwards.");
        RuleFor(c => c.Guests)
            .InclusiveBetween(1, MaxGuests)
            .WithMessage($"Enter between 1 and {MaxGuests} kids.");
        RuleFor(c => c.TimeOfDay)
            .Must(t => t is "morning" or "afternoon" or "evening")
            .WithMessage("Choose morning, afternoon or evening.");
        RuleFor(c => c.Budget)
            .InclusiveBetween(0, 20000)
            .WithMessage("Enter a budget between $0 and $20,000.");
        RuleFor(c => c.PostalCode)
            .Must(code => PostalCode.TryParse(code, out _))
            .WithMessage("Enter a Canadian postal code, like M4M 1H1.");
        When(c => c.ChildId is null, () =>
        {
            RuleFor(c => c.ChildName)
                .Must(name => !string.IsNullOrWhiteSpace(name) && name.Trim().Length <= 40)
                .WithMessage("Tell us the birthday star’s first name.");
            RuleFor(c => c.TurningAge)
                .NotNull().InclusiveBetween(1, 17)
                .WithMessage("Enter the age they’re turning, from 1 to 17.");
        });
        When(c => c.ChildId is not null, () =>
        {
            RuleFor(c => c.ChildId)
                .MustAsync(async (id, cancel) =>
                {
                    var family = await db.Families.SingleOrDefaultAsync(f => f.Id == parent.Id, cancel);
                    return family?.Children.Any(c => c.Id == id) == true;
                })
                .WithMessage("Choose one of your children, or someone else.");
        });
    }
}
