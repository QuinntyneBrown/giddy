namespace Giddy.Application.Wrapping;

/// <param name="Status">draft or sent.</param>
/// <param name="CanSend">False when Giddy has no email for the guest's parent.</param>
public sealed record ThankYouNoteView(
    Guid GuestId,
    string ChildName,
    string ParentName,
    string? Gift,
    string Message,
    string Status,
    bool CanSend);
