namespace Giddy.Application.Invitations;

/// <param name="Place">The venue and its address, or the party's area until a venue is chosen.</param>
public sealed record InvitationDetails(string ChildName, string Date, string StartsAt, string EndsAt, string? Place, string HostName);
