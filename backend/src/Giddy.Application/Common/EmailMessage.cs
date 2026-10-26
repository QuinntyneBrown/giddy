namespace Giddy.Application.Common;

/// <param name="Reference">Echoed back by the provider's delivery events, for example a guest's id.</param>
public sealed record EmailMessage(string To, string Subject, string Body, string? Reference = null);
