namespace Giddy.Application.Guests.Import;

/// <summary>An uploaded class list, held in memory only.</summary>
/// <param name="Length">The size the upload declared; files over the limit are refused unread, with no content.</param>
public sealed record ImportFile(string FileName, long Length, byte[] Content);
