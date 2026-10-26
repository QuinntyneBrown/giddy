using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using Giddy.Api.IntegrationTests.Support;
using Giddy.Domain.Memories;
using Giddy.Domain.Parties;
using Giddy.Infrastructure.Persistence.Seeding;
using NodaTime;
using Xunit;

namespace Giddy.Api.IntegrationTests;

/// <summary>L2-021 and L2-066: what Giddy remembers, per family, and forgetting it.</summary>
public sealed class AgentMemoryTests : IAsyncLifetime
{
    private readonly GiddyApiFactory factory = new();
    private readonly Party dinoParty = TestData.DinoParty();
    private ChatClient amara = null!;

    public async ValueTask InitializeAsync()
    {
        await factory.SeedAsync(db =>
        {
            db.Parties.Add(dinoParty);
            db.CatalogueItems.AddRange(DemoCatalogue.Items());
            db.Memories.Add(new Memory(Guid.NewGuid(), TestParent.Stranger.Id, "Noah is allergic to sesame", Instant.FromUtc(2026, 10, 1, 12, 0)));
        });
        amara = new ChatClient(await factory.CreateBrowserClientFor(TestParent.Amara));
    }

    [Fact]
    public async Task A_lasting_fact_Giddy_remembers_shows_in_the_chat_and_in_settings()
    {
        factory.Model.CallsTool("remember", new { fact = "Zuri loves dinosaurs, digging and science" }).Replies("Noted!");

        var (conversationId, turnId) = await amara.SendAsync("She loves dinosaurs, digging and science");
        await amara.WaitForTurnAsync(conversationId, turnId);

        var memories = await amara.Http.GetFromJsonAsync<JsonElement>("/api/memories");
        Assert.Equal(["Zuri loves dinosaurs, digging and science"], memories.EnumerateArray().Select(m => m.GetProperty("text").GetString()!));
        var inChat = (await amara.CurrentAsync()).GetProperty("memories");
        Assert.Equal("Zuri loves dinosaurs, digging and science", inChat[0].GetProperty("text").GetString());
    }

    [Fact]
    public async Task Contact_details_are_never_remembered()
    {
        factory.Model.CallsTool("remember", new { fact = "Hana's mom is at 416-555-0199" }).Replies("Okay.");

        var (conversationId, turnId) = await amara.SendAsync("Call Hana's mom at 416-555-0199");
        await amara.WaitForTurnAsync(conversationId, turnId);

        Assert.Empty((await amara.Http.GetFromJsonAsync<JsonElement>("/api/memories")).EnumerateArray());
    }

    [Fact]
    public async Task A_forgotten_memory_is_gone_and_no_longer_used()
    {
        factory.Model.CallsTool("remember", new { fact = "You prefer venues with parking" }).Replies("Noted.");
        var (conversationId, turnId) = await amara.SendAsync("We need parking");
        await amara.WaitForTurnAsync(conversationId, turnId);
        var memoryId = (await amara.Http.GetFromJsonAsync<JsonElement>("/api/memories"))[0].GetProperty("id").GetGuid();

        var forget = await amara.Http.DeleteAsync($"/api/memories/{memoryId}");
        factory.Model.Requests.Clear();
        factory.Model.Replies("Sure.");
        (conversationId, turnId) = await amara.SendAsync("What else?");
        await amara.WaitForTurnAsync(conversationId, turnId);

        Assert.Equal(HttpStatusCode.NoContent, forget.StatusCode);
        Assert.Empty((await amara.Http.GetFromJsonAsync<JsonElement>("/api/memories")).EnumerateArray());
        var prompt = factory.Model.Requests.Single().Messages[0].Content.OfType<Giddy.Application.Agent.Model.TextContent>().Single().Text;
        Assert.DoesNotContain("<family_memories>", prompt);
        Assert.DoesNotContain("You prefer venues with parking", prompt);
    }

    [Fact]
    public async Task Another_familys_memories_are_never_used_or_revealed()
    {
        factory.Model.Replies("Hi!");

        var (conversationId, turnId) = await amara.SendAsync("What do you know about other families?");
        await amara.WaitForTurnAsync(conversationId, turnId);

        Assert.DoesNotContain("sesame", factory.Model.AllShownText());
        Assert.Empty((await amara.Http.GetFromJsonAsync<JsonElement>("/api/memories")).EnumerateArray());
    }

    [Fact]
    public async Task A_parent_cannot_forget_another_familys_memory()
    {
        var strangersMemory = await factory.QueryAsync(db => Task.FromResult(db.Memories.Single().Id));

        var response = await amara.Http.DeleteAsync($"/api/memories/{strangersMemory}");

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
        Assert.Equal(1, await factory.QueryAsync(db => Task.FromResult(db.Memories.Count())));
    }

    public ValueTask DisposeAsync()
    {
        factory.Dispose();
        return ValueTask.CompletedTask;
    }
}
