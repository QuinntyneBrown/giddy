namespace Giddy.Application.Common;

/// <summary>The caller can see the resource but their role does not allow this action.</summary>
public sealed class ForbiddenException(string message) : Exception(message);
