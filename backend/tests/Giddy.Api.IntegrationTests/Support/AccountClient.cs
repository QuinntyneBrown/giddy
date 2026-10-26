using System.Net.Http.Json;
using System.Text.Json;

namespace Giddy.Api.IntegrationTests.Support;

/// <summary>A browser with no one signed in: it keeps cookies and sends the anti-forgery token, as the web app does.</summary>
public sealed class AccountClient(HttpClient client) : IDisposable
{
    public HttpClient Http => client;

    public async Task RefreshAntiforgeryAsync()
    {
        client.DefaultRequestHeaders.Remove("X-XSRF-TOKEN");
        var token = await client.GetFromJsonAsync<JsonElement>("/api/antiforgery");
        client.DefaultRequestHeaders.Add("X-XSRF-TOKEN", token.GetProperty("token").GetString());
    }

    public async Task<HttpResponseMessage> PostAsync(string url, object body)
    {
        var response = await client.PostAsJsonAsync(url, body);
        if (response.IsSuccessStatusCode)
        {
            // A new session means a new anti-forgery token, as the web app fetches after signing in.
            await RefreshAntiforgeryAsync();
        }

        return response;
    }

    public void Dispose() => client.Dispose();
}
