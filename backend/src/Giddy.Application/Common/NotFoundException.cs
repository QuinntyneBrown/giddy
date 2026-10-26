namespace Giddy.Application.Common;

/// <summary>The resource does not exist, or the caller is not allowed to know it exists.</summary>
public sealed class NotFoundException(string message) : Exception(message);
