using MediatR;

namespace Giddy.Application.Settings;

public sealed record RequestEmailChangeCommand(string Email) : IRequest;
