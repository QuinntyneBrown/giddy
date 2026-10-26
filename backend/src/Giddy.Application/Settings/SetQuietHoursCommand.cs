using MediatR;

namespace Giddy.Application.Settings;

public sealed record SetQuietHoursCommand(bool On) : IRequest<SettingsView>;
