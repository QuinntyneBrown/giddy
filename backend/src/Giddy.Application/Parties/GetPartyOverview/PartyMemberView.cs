using Giddy.Domain.Parties;

namespace Giddy.Application.Parties.GetPartyOverview;

public sealed record PartyMemberView(Guid ParentId, string Name, PartyRole Role, bool IsYou);
