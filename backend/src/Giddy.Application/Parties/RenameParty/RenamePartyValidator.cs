using FluentValidation;
using Giddy.Domain.Parties;

namespace Giddy.Application.Parties.RenameParty;

public sealed class RenamePartyValidator : AbstractValidator<RenamePartyCommand>
{
    public RenamePartyValidator()
    {
        RuleFor(c => c.Name)
            .Cascade(CascadeMode.Stop)
            .Must(name => !string.IsNullOrWhiteSpace(name)).WithMessage("Give the party a name.")
            .Must(name => name.Trim().Length <= Party.NameMaxLength)
            .WithMessage($"Keep the name to {Party.NameMaxLength} characters or fewer.")
            .Must(name => !name.Any(char.IsControl)).WithMessage("Use letters, numbers and punctuation only.");
    }
}
