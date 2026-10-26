using MediatR;

namespace Giddy.Application.Settings;

public sealed record UpdateProfileCommand(string FirstName, string? LastName, string? Mobile, string? PostalCode) : IRequest<SettingsView>;
