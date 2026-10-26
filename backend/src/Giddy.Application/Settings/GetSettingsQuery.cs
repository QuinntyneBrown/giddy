using MediatR;

namespace Giddy.Application.Settings;

public sealed record GetSettingsQuery : IRequest<SettingsView>;
