namespace Giddy.Application.Sharing;

public sealed record MembersView(IReadOnlyList<MemberView> Members, IReadOnlyList<InvitedView> Invited);
