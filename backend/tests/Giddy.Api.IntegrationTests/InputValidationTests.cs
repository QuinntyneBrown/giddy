using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using Giddy.Api.IntegrationTests.Support;
using Giddy.Domain.Parties;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace Giddy.Api.IntegrationTests;

/// <summary>L2-071 and L2-070: allow-list validation and anti-forgery on state changes.</summary>
public sealed class InputValidationTests : IAsyncLifetime
{
    private readonly GiddyApiFactory factory = new();
    private readonly Party dinoParty = TestData.DinoParty();
    private CancellationToken Cancel => TestContext.Current.CancellationToken;

    public async ValueTask InitializeAsync() => await factory.SeedAsync(db => db.Parties.Add(dinoParty));

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    [InlineData("This party name is far too long to be useful on an invitation, a card or a phone screen")]
    public async Task Invalid_input_is_rejected_with_field_errors_and_nothing_changes(string name)
    {
        using var client = await factory.CreateBrowserClientFor(TestParent.Amara);

        var response = await client.PutAsJsonAsync($"/api/parties/{dinoParty.Id}", new { name }, Cancel);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        var problem = await response.Content.ReadFromJsonAsync<JsonElement>(Cancel);
        Assert.True(problem.GetProperty("errors").TryGetProperty("name", out _));
        Assert.Equal("Zuri’s Dino Dig 7th", await NameOf(dinoParty.Id));
    }

    [Fact]
    public async Task Html_in_user_text_is_stored_and_returned_as_plain_text()
    {
        using var client = await factory.CreateBrowserClientFor(TestParent.Amara);

        await client.PutAsJsonAsync($"/api/parties/{dinoParty.Id}", new { name = "<b>Zuri</b>" }, Cancel);
        var party = await client.GetFromJsonAsync<JsonElement>($"/api/parties/{dinoParty.Id}", Cancel);

        Assert.Equal("<b>Zuri</b>", party.GetProperty("name").GetString());
    }

    [Fact]
    public async Task State_changing_requests_without_the_anti_forgery_token_are_rejected()
    {
        using var client = factory.CreateClientFor(TestParent.Amara);

        var response = await client.PutAsJsonAsync($"/api/parties/{dinoParty.Id}", new { name = "No token" }, Cancel);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        Assert.Equal("Zuri’s Dino Dig 7th", await NameOf(dinoParty.Id));
    }

    private Task<string> NameOf(Guid partyId) =>
        factory.QueryAsync(db => db.Parties.Where(p => p.Id == partyId).Select(p => p.Name).SingleAsync());

    public ValueTask DisposeAsync()
    {
        factory.Dispose();
        return ValueTask.CompletedTask;
    }
}
