using FluentValidation;

namespace Giddy.Application.Conversations.SendMessage;

public sealed class SendMessageValidator : AbstractValidator<SendMessageCommand>
{
    public SendMessageValidator()
    {
        RuleFor(c => c.Text)
            .Cascade(CascadeMode.Stop)
            .Must(text => !string.IsNullOrWhiteSpace(text)).WithMessage("Write a message for Giddy.")
            .MaximumLength(SendMessageCommand.TextMaxLength).WithMessage("Keep messages to 2,000 characters.");
    }
}
