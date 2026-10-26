using System.Globalization;
using FluentValidation;
using Giddy.Application.Common;
using Microsoft.EntityFrameworkCore;
using NodaTime.Text;

namespace Giddy.Application.Checklist.Tasks;

public sealed class SaveTaskValidator : AbstractValidator<SaveTaskCommand>
{
    private static readonly LocalDatePattern Day = LocalDatePattern.Create("ddd d MMM", CultureInfo.InvariantCulture);

    public SaveTaskValidator(IGiddyDbContext db)
    {
        RuleFor(c => c.Title).Must(t => !string.IsNullOrWhiteSpace(t)).WithMessage("Say what needs doing");
        RuleFor(c => c.Title).MaximumLength(100).WithMessage("Keep it under 100 characters");
        RuleFor(c => c.Due).CustomAsync(async (due, context, cancellationToken) =>
        {
            var party = await db.Parties.SingleOrDefaultAsync(p => p.Id == context.InstanceToValidate.PartyId, cancellationToken);
            var parsed = LocalDatePattern.Iso.Parse(due ?? string.Empty);
            if (!parsed.Success)
            {
                context.AddFailure("Choose the date it’s due");
            }
            else if (party is not null && parsed.Value > party.Date)
            {
                context.AddFailure($"Choose a date on or before the party, {Day.Format(party.Date)}");
            }
        });
        RuleFor(c => c.OwnerId).CustomAsync(async (owner, context, cancellationToken) =>
        {
            var party = await db.Parties.SingleOrDefaultAsync(p => p.Id == context.InstanceToValidate.PartyId, cancellationToken);
            if (owner is { } id && party is not null && !party.IsPlanner(id))
            {
                context.AddFailure("Choose someone who is planning this party");
            }
        });
    }
}
