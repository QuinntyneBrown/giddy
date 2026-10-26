namespace Giddy.Application.Wrapping;

/// <param name="Open">Whether the party has happened; wrap-up opens the day after.</param>
/// <param name="OpensOn">ISO date of the day after the party.</param>
/// <param name="Template">The saved plan for next year; null until it is saved.</param>
public sealed record WrapUpView(
    bool Open,
    string OpensOn,
    string? ChildName,
    IReadOnlyList<ThankYouNoteView> Notes,
    IReadOnlyList<ProviderView> Providers,
    FinalNumbers Numbers,
    TemplateView? Template);
