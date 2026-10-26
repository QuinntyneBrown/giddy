namespace Giddy.Application.Guests.Import;

/// <summary>The file can't be imported; nothing was added.</summary>
public sealed class InvalidImportFileException(string message) : Exception(message);
