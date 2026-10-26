using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using Giddy.Api.IntegrationTests.Support;
using Xunit;

namespace Giddy.Api.IntegrationTests;

/// <summary>L2-090: Canadian postal codes, and whether they are inside the GTA service area.</summary>
public sealed class ServiceAreaTests : IDisposable
{
    private readonly GiddyApiFactory factory = new();
    private CancellationToken Cancel => TestContext.Current.CancellationToken;

    [Theory]
    [InlineData("M4M 1H1", "M4M 1H1", "Toronto")]
    [InlineData("m4m1h1", "M4M 1H1", "Toronto")]
    [InlineData("L1S 2J5", "L1S 2J5", "Durham")]
    [InlineData("L4C 3B9", "L4C 3B9", "York")]
    [InlineData("L5B 2C9", "L5B 2C9", "Peel")]
    [InlineData("L6J 1H3", "L6J 1H3", "Halton")]
    public async Task Postal_codes_in_the_gta_are_in_the_service_area(string input, string normalised, string region)
    {
        using var client = factory.CreateClientFor(TestParent.Amara);

        var area = await client.GetFromJsonAsync<ServiceAreaResponse>($"/api/service-area?postalCode={Uri.EscapeDataString(input)}", Cancel);

        Assert.Equal(new ServiceAreaResponse(normalised, true, region), area);
    }

    [Fact]
    public async Task A_valid_postal_code_outside_the_gta_is_accepted_but_outside_the_service_area()
    {
        using var client = factory.CreateClientFor(TestParent.Amara);

        var area = await client.GetFromJsonAsync<ServiceAreaResponse>("/api/service-area?postalCode=K1A%200B1", Cancel);

        Assert.Equal(new ServiceAreaResponse("K1A 0B1", false, null), area);
    }

    [Theory]
    [InlineData("12345")]
    [InlineData("D4M 1H1")]
    [InlineData("M4M 1H")]
    public async Task An_invalid_postal_code_is_rejected_with_a_field_error(string input)
    {
        using var client = factory.CreateClientFor(TestParent.Amara);

        var response = await client.GetAsync($"/api/service-area?postalCode={Uri.EscapeDataString(input)}", Cancel);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        var problem = await response.Content.ReadFromJsonAsync<JsonElement>(Cancel);
        Assert.True(problem.GetProperty("errors").TryGetProperty("postalCode", out _));
    }

    public void Dispose() => factory.Dispose();

    private sealed record ServiceAreaResponse(string PostalCode, bool InServiceArea, string? Region);
}
