namespace Giddy.Application.Common;

/// <summary>Absolute links into the web app, for messages sent outside it.</summary>
public interface IWebLinks
{
    string To(string path);
}
