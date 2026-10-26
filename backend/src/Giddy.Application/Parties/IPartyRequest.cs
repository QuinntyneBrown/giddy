namespace Giddy.Application.Parties;

/// <summary>A request scoped to one party. The pipeline authorises it before the handler runs.</summary>
public interface IPartyRequest
{
    Guid PartyId { get; }

    PartyAccess RequiredAccess { get; }
}
