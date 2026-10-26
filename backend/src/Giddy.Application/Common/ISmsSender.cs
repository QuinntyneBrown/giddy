namespace Giddy.Application.Common;

public interface ISmsSender
{
    Task SendAsync(TextMessage message, CancellationToken cancellationToken);
}
