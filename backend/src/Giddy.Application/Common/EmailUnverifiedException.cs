namespace Giddy.Application.Common;

/// <summary>The action sends email on the parent's behalf, so their own address must be verified first.</summary>
public sealed class EmailUnverifiedException(string message) : Exception(message);
