using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using Giddy.Api.IntegrationTests.Support;
using Giddy.Domain.Guests;
using Giddy.Domain.Parties;
using Giddy.Infrastructure.Persistence.Seeding;
using Xunit;

namespace Giddy.Api.IntegrationTests;

/// <summary>L2-045: a bounced invitation tells the host which family to fix.</summary>
public sealed class EmailEventsTests : IAsyncLifetime
{
    private readonly GiddyApiFactory factory = new();
    private readonly Party dinoParty = TestData.DinoParty().WithPlan();
    private IReadOnlyList<Guest> guests = [];
    private CancellationToken Cancel => TestContext.Current.CancellationToken;

    public async ValueTask InitializeAsync()
    {
        guests = TestData.GuestsFor(dinoParty);
        await factory.SeedAsync(db =>
        {
            TestData.AddPeople(db);
            db.Parties.Add(dinoParty);
            db.Guests.AddRange(guests);
            db.CatalogueItems.AddRange(DemoCatalogue.Items());
        });
        using var amara = await factory.CreateBrowserClientFor(TestParent.Amara);
        (await amara.PostAsync($"/api/parties/{dinoParty.Id}/invitation/send", null, Cancel)).EnsureSuccessStatusCode();
    }

    [Fact]
    public async Task A_bounce_marks_the_family_and_tells_the_host()
    {
        using var amara = factory.CreateClientFor(TestParent.Amara);
        var cursor = (await amara.GetFromJsonAsync<JsonElement>("/api/live-updates", Cancel)).GetProperty("cursor").GetInt64();
        var maya = factory.Email.Sent.Single(e => e.To == "lily.chen@example.com").Reference;

        var response = await PostAsync(new { type = "bounced", reference = maya }, GiddyApiFactory.EmailEventsSecret);

        Assert.Equal(HttpStatusCode.Accepted, response.StatusCode);
        var list = await amara.GetFromJsonAsync<JsonElement>($"/api/parties/{dinoParty.Id}/guests", Cancel);
        Assert.True(list.GetProperty("guests").EnumerateArray().Single(g => g.GetProperty("childName").GetString() == "Maya Chen").GetProperty("emailBounced").GetBoolean());
        var update = Assert.Single((await amara.GetFromJsonAsync<JsonElement>($"/api/live-updates?after={cursor}", Cancel)).GetProperty("events").EnumerateArray());
        Assert.Equal(("danger", "The invitation to the Chen family bounced", "Fix email"), (update.GetProperty("tone").GetString(), update.GetProperty("title").GetString(), update.GetProperty("action").GetProperty("label").GetString()));
    }

    [Theory]
    [InlineData(null)]
    [InlineData("wrong")]
    public async Task Events_without_the_shared_secret_are_refused(string? secret)
    {
        var response = await PostAsync(new { type = "bounced", reference = guests[0].Id.ToString() }, secret);

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
        Assert.False(await factory.QueryAsync(db => Task.FromResult(db.Guests.Single(g => g.Id == guests[0].Id).EmailBounced)));
    }

    [Fact]
    public async Task Events_for_unknown_messages_are_ignored()
    {
        var response = await PostAsync(new { type = "bounced", reference = Guid.NewGuid().ToString() }, GiddyApiFactory.EmailEventsSecret);

        Assert.Equal(HttpStatusCode.Accepted, response.StatusCode);
        Assert.Empty(await factory.QueryAsync(db => Task.FromResult(db.PartyEvents.Where(e => e.Kind == "bounced").ToList())));
    }

    public ValueTask DisposeAsync()
    {
        factory.Dispose();
        return ValueTask.CompletedTask;
    }

    private async Task<HttpResponseMessage> PostAsync(object body, string? secret)
    {
        using var provider = factory.CreateClient();
        using var request = new HttpRequestMessage(HttpMethod.Post, "/api/email-events") { Content = JsonContent.Create(body) };
        if (secret is not null)
        {
            request.Headers.Add("X-Giddy-Webhook-Secret", secret);
        }

        return await provider.SendAsync(request, Cancel);
    }
}
