using Microsoft.Extensions.Logging;

namespace Giddy.Api.IntegrationTests.Support;

/// <summary>Writes API errors to a file when GIDDY_TEST_LOG is set, for diagnosing a failing test.</summary>
public sealed class FileLoggerProvider(string path) : ILoggerProvider
{
    public ILogger CreateLogger(string categoryName) => new FileLogger(path, categoryName);

    public void Dispose()
    {
    }

    private sealed class FileLogger(string path, string category) : ILogger
    {
        private static readonly Lock Gate = new();

        public IDisposable? BeginScope<TState>(TState state) where TState : notnull => null;

        public bool IsEnabled(LogLevel logLevel) => logLevel >= LogLevel.Warning;

        public void Log<TState>(LogLevel logLevel, EventId eventId, TState state, Exception? exception, Func<TState, Exception?, string> formatter)
        {
            if (!IsEnabled(logLevel)) return;
            lock (Gate)
            {
                File.AppendAllText(path, $"{logLevel} {category}: {formatter(state, exception)}\n{exception}\n");
            }
        }
    }
}
