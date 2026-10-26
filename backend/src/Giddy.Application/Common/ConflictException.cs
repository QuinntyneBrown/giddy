namespace Giddy.Application.Common;

/// <summary>The request conflicts with the resource's state, for example a change to a locked party.</summary>
public sealed class ConflictException(string message) : Exception(message);
