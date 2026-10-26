using Giddy.Application.Conversations.Views;
using MediatR;

namespace Giddy.Application.Memories;

public sealed record GetMemoriesQuery : IRequest<IReadOnlyList<MemoryView>>;
