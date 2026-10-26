using MediatR;

namespace Giddy.Application.Privacy;

public sealed record DeleteAccountCommand(string Email) : IRequest;
