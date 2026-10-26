namespace Giddy.Application.Rsvps;

/// <summary>The private link is unknown, replaced, revoked or for a deleted party. Says nothing about any party.</summary>
public sealed class RsvpLinkNotWorkingException() : Exception("This link no longer works. Ask the family who invited you to send it again.");
