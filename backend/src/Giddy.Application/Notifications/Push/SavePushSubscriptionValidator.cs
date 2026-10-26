using FluentValidation;

namespace Giddy.Application.Notifications.Push;

public sealed class SavePushSubscriptionValidator : AbstractValidator<SavePushSubscriptionCommand>
{
    public SavePushSubscriptionValidator()
    {
        RuleFor(c => c.Endpoint)
            .Must(e => Uri.TryCreate(e, UriKind.Absolute, out var uri) && uri.Scheme == Uri.UriSchemeHttps)
            .WithMessage("The browser’s push service must use https.");
        RuleFor(c => c.P256dh).NotEmpty().MaximumLength(200);
        RuleFor(c => c.Auth).NotEmpty().MaximumLength(100);
    }
}
