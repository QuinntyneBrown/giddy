namespace Giddy.Domain.Parties;

public static class PartyRolePermissions
{
    /// <summary>Owners and co-planners can change a party; viewers can only look.</summary>
    public static bool CanPlan(this PartyRole role) => role is PartyRole.Owner or PartyRole.CoPlanner;
}
