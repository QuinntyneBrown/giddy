using MediatR;

namespace Giddy.Application.Memories;

public sealed record ForgetMemoryCommand(Guid MemoryId) : IRequest;
