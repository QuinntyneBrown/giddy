using Giddy.Domain.Parties;

namespace Giddy.Application.Sharing;

public sealed record MemberView(Guid ParentId, string Name, PartyRole Role, bool IsYou);
