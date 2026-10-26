namespace Giddy.Application.Common;

public sealed record EmailMessage(string To, string Subject, string Body);
