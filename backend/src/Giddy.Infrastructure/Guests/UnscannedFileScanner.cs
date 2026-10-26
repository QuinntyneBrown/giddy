using Giddy.Application.Guests.Import;
using Microsoft.Extensions.Logging;

namespace Giddy.Infrastructure.Guests;

/// <summary>
/// Stands in until a malware-scanning service is connected: lets files through and logs that
/// they were not scanned. Files are read in memory only and never stored.
/// </summary>
public sealed class UnscannedFileScanner(ILogger<UnscannedFileScanner> logger) : IMalwareScanner
{
    public Task<bool> IsCleanAsync(Stream content, CancellationToken cancellationToken)
    {
        logger.LogWarning("Imported file was not scanned for malware: no scanner is configured");
        return Task.FromResult(true);
    }
}
