using Giddy.Application.Common;
using Giddy.Domain.Notifications;
using Giddy.Domain.Parties;
using NodaTime;

namespace Giddy.Application.Notifications;

/// <summary>Tells a party's other planners what one of them just did, naming who did it.</summary>
public sealed class PlannerNews(IGiddyDbContext db, ICurrentParent parent, IClock clock)
{
    /// <summary>Adds the news for the owner and co-planners other than the one who acted; saved with the change.</summary>
    /// <param name="did">What they did, after their name, such as "sent the invitations".</param>
    public void TellOthers(Party party, string icon, string did, string detail, string link)
    {
        var actor = parent.Name.Split(' ')[0];
        var now = clock.GetCurrentInstant();
        foreach (var member in party.Members.Where(m => m.Role != PartyRole.Viewer && m.ParentId != parent.Id))
        {
            db.InboxItems.Add(new InboxItem(member.ParentId, icon, $"{actor} {did}", detail, link, now));
        }
    }

    /// <summary>For every planner, when someone outside the party (a guest or a vendor) did something.</summary>
    public void TellPlanners(Party party, string icon, string title, string detail, string link)
    {
        var now = clock.GetCurrentInstant();
        foreach (var member in party.Members.Where(m => m.Role != PartyRole.Viewer))
        {
            db.InboxItems.Add(new InboxItem(member.ParentId, icon, title, detail, link, now));
        }
    }
}
