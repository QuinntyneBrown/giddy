namespace Giddy.Domain.Invitations;

/// <summary>The four launch designs.</summary>
public static class InvitationDesigns
{
    public static readonly IReadOnlyList<string> All = ["dino-green", "volcano", "fossil", "night-sky"];

    public static string For(string? theme) =>
        theme is not null && theme.Contains("dino", StringComparison.OrdinalIgnoreCase) ? "dino-green" : "night-sky";
}
