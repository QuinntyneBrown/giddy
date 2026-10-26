using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using Giddy.Api.IntegrationTests.Support;
using Giddy.Domain.Parties;
using Giddy.Infrastructure.Persistence.Seeding;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace Giddy.Api.IntegrationTests;

/// <summary>L2-015, L2-016, L2-019 and L2-020: talking with Giddy and seeing its work.</summary>
public sealed class ConverseWithGiddyTests : IAsyncLifetime
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
        });
        amara = new ChatClient(await factory.CreateBrowserClientFor(TestParent.Amara));
    }

    [Fact]
    public async Task A_new_conversation_shows_the_party_at_a_glance()
    {
        var conversation = await amara.CurrentAsync();

        var party = conversation.GetProperty("party");
        Assert.Equal(dinoParty.Id, party.GetProperty("partyId").GetGuid());
        Assert.Equal("Zuri", party.GetProperty("childName").GetString());
        Assert.Equal(7, party.GetProperty("turningAge").GetInt32());
        Assert.Equal("Zuri, turning 7", party.GetProperty("who").GetString());
        Assert.Equal("2026-11-14", party.GetProperty("date").GetString());
        Assert.Equal("afternoon", party.GetProperty("timeOfDay").GetString());
        Assert.Equal("Leslieville", party.GetProperty("area").GetString());
        Assert.Equal(8, party.GetProperty("radiusKm").GetInt32());
        Assert.Equal(15, party.GetProperty("guests").GetInt32());
        Assert.Equal(800, party.GetProperty("budget").GetDecimal());
        Assert.Empty(conversation.GetProperty("messages").EnumerateArray());
    }

    [Fact]
    public async Task Each_tool_appears_as_a_plain_step_and_is_ticked_with_what_it_checked()
    {
        factory.Model.CallsTool("search_venues").Replies("Dino Den is free that Saturday.");

        var (conversationId, turnId) = await amara.SendAsync("Find us a venue");
        var turn = await amara.WaitForTurnAsync(conversationId, turnId);

        var events = turn.GetProperty("events").EnumerateArray().ToList();
        Assert.Equal("completed", turn.GetProperty("status").GetString());
        Assert.Equal(["step.started", "step.done", "reply.done"], events.Select(e => e.GetProperty("type").GetString()!));
        Assert.Equal("Checking venues within 8 km for Sat 14 Nov afternoon…", events[0].GetProperty("text").GetString());
        Assert.Equal("Checked 7 venues within 8 km for Sat 14 Nov afternoon", events[1].GetProperty("text").GetString());

        var reply = await amara.LastGiddyMessageAsync();
        Assert.Equal("Dino Den is free that Saturday.", reply.GetProperty("text").GetString());
        Assert.Equal("Checked 7 venues within 8 km for Sat 14 Nov afternoon", reply.GetProperty("steps")[0].GetProperty("text").GetString());
    }

    [Fact]
    public async Task Searches_only_return_venues_free_on_the_date_in_the_area_that_fit_the_guests()
    {
        factory.Model.CallsTool("search_venues").Replies("Here are the venues.");

        var (conversationId, turnId) = await amara.SendAsync("Venues please");
        await amara.WaitForTurnAsync(conversationId, turnId);

        var shown = factory.Model.AllShownText();
        Assert.Contains("Dino Den Play Café", shown);
        Assert.DoesNotContain("Danforth Party Room", shown);
        Assert.DoesNotContain("Mississauga Fun Zone", shown);
        Assert.DoesNotContain("Tiny Hall", shown);
    }

    [Fact]
    public async Task Suggested_replies_are_offered_when_Giddy_asks_a_question()
    {
        factory.Model
            .CallsTool("suggest_replies", new { replies = new[] { "Yes, add a GF pizza", "Keep the regular cake", "Show other bakeries", "Not now", "Too many" } })
            .Replies("Want me to ask Pizza Nonna for one gluten-free pizza too?");

        var (conversationId, turnId) = await amara.SendAsync("Can the cake be gluten-free?");
        await amara.WaitForTurnAsync(conversationId, turnId);

        var reply = await amara.LastGiddyMessageAsync();
        Assert.Equal(["Yes, add a GF pizza", "Keep the regular cake", "Show other bakeries", "Not now"],
            reply.GetProperty("suggestions").EnumerateArray().Select(s => s.GetString()!));
    }

    [Fact]
    public async Task Stop_cancels_a_running_turn_quickly_and_keeps_the_finished_steps()
    {
        factory.Model.CallsTool("search_venues").Hangs();
        var (conversationId, turnId) = await amara.SendAsync("Plan the whole party");
        await WaitForEventAsync(conversationId, turnId, "step.done");

        var stopped = DateTime.UtcNow;
        var cancel = await amara.Http.PostAsync($"/api/conversations/{conversationId}/turns/{turnId}/cancel", null);
        var turn = await amara.WaitForTurnAsync(conversationId, turnId);

        Assert.Equal(HttpStatusCode.Accepted, cancel.StatusCode);
        Assert.Equal("cancelled", turn.GetProperty("status").GetString());
        Assert.True(DateTime.UtcNow - stopped < TimeSpan.FromSeconds(1));
        var reply = await amara.LastGiddyMessageAsync();
        Assert.Equal("Checked 7 venues within 8 km for Sat 14 Nov afternoon", reply.GetProperty("steps")[0].GetProperty("text").GetString());
    }

    [Fact]
    public async Task An_unavailable_model_fails_the_turn_with_a_clear_message_and_keeps_the_parents_message()
    {
        factory.Model.IsUnavailable();

        var (conversationId, turnId) = await amara.SendAsync("Plan Zuri's party");
        var turn = await amara.WaitForTurnAsync(conversationId, turnId);

        Assert.Equal("failed", turn.GetProperty("status").GetString());
        var failure = turn.GetProperty("events").EnumerateArray().Last();
        Assert.Equal("turn.failed", failure.GetProperty("type").GetString());
        Assert.StartsWith("Giddy can’t answer right now", failure.GetProperty("text").GetString());
        var conversation = await amara.CurrentAsync();
        Assert.Equal("Plan Zuri's party", conversation.GetProperty("messages")[0].GetProperty("text").GetString());
    }

    [Fact]
    public async Task Empty_messages_are_rejected_with_a_field_error()
    {
        var conversation = await amara.CurrentAsync();

        var response = await amara.Http.PostAsJsonAsync($"/api/conversations/{conversation.GetProperty("id").GetGuid()}/messages", new { text = "  " });

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task Another_parent_cannot_read_or_write_to_the_conversation()
    {
        var conversationId = (await amara.CurrentAsync()).GetProperty("id").GetGuid();
        using var stranger = await factory.CreateBrowserClientFor(TestParent.Stranger);

        var read = await stranger.GetAsync($"/api/conversations/{conversationId}/turns/{Guid.NewGuid()}");
        var write = await stranger.PostAsJsonAsync($"/api/conversations/{conversationId}/messages", new { text = "Hi" });

        Assert.Equal(HttpStatusCode.NotFound, read.StatusCode);
        Assert.Equal(HttpStatusCode.NotFound, write.StatusCode);
        Assert.Equal(0, await factory.QueryAsync(db => db.Conversations.Where(c => c.Id == conversationId).SelectMany(c => c.Messages).CountAsync()));
    }

    [Fact]
    public async Task Every_turn_is_logged_with_the_party_for_support_and_safety_review()
    {
        factory.Model.CallsTool("search_venues").Replies("Done.");

        var (conversationId, turnId) = await amara.SendAsync("Venues");
        await amara.WaitForTurnAsync(conversationId, turnId);

        var kinds = await factory.QueryAsync(db => db.TurnLogs.Where(l => l.TurnId == turnId && l.PartyId == dinoParty.Id).Select(l => l.Kind).ToListAsync());
        Assert.Equal(["prompt", "tool_call", "tool_result", "reply"], kinds);
    }

    private async Task WaitForEventAsync(Guid conversationId, Guid turnId, string type)
    {
        for (var i = 0; i < 200; i++)
        {
            var turn = await amara.Http.GetFromJsonAsync<JsonElement>($"/api/conversations/{conversationId}/turns/{turnId}?after=0");
            if (turn.GetProperty("events").EnumerateArray().Any(e => e.GetProperty("type").GetString() == type)) return;
            await Task.Delay(25);
        }

        throw new TimeoutException(type);
    }

    public ValueTask DisposeAsync()
    {
        factory.Dispose();
        return ValueTask.CompletedTask;
    }
}
