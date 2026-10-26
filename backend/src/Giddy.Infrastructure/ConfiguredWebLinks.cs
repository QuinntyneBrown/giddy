using Giddy.Application.Common;
using Microsoft.Extensions.Configuration;

namespace Giddy.Infrastructure;

/// <summary>Links on the web app's address from Giddy:WebBaseUrl (http://localhost:4200 by default).</summary>
public sealed class ConfiguredWebLinks(IConfiguration configuration) : IWebLinks
{
    public string To(string path) => $"{(configuration["Giddy:WebBaseUrl"] ?? "http://localhost:4200").TrimEnd('/')}{path}";
}
