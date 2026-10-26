using MediatR;

namespace Giddy.Application.Settings;

public sealed record SetNotificationsCommand(NotificationChoices Choices) : IRequest<SettingsView>;
