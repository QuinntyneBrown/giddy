using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text;
using System.Text.Json;
using DocumentFormat.OpenXml;
using DocumentFormat.OpenXml.Packaging;
using DocumentFormat.OpenXml.Spreadsheet;
using Giddy.Api.IntegrationTests.Support;
using Giddy.Domain.Guests;
using Giddy.Domain.Parties;
using NodaTime;
using Xunit;

namespace Giddy.Api.IntegrationTests;

/// <summary>L2-040: import a class list or reuse last year's guests.</summary>
public sealed class ImportGuestsTests : IAsyncLifetime
{
    private const string ClassList = """
        Child,Parent,Email,Mobile
        Maya Chen,Lily Chen,lily.chen@example.com,416-555-0177
        Noah Tremblay,Julie Tremblay,julie.tremblay@example.com,416-555-0110
        "O'Brien, Liam",Siobhan O'Brien,siobhan.obrien@example.com,
        Aisha Mohamed,Hodan Mohamed,,
        Hana Sato,Kenji Sato,kenji.sato@example.com,647-555-0132
        """;

    private readonly GiddyApiFactory factory = new();
    private readonly Party dinoParty = TestData.DinoParty().WithPlan();
    private readonly Party lastYear = Party.Plan(Guid.NewGuid(), "Zuri’s 6th: Mermaid Splash", new LocalDate(2025, 11, 15), new LocalTime(13, 0), new LocalTime(15, 0), TestParent.Amara.Id);
    private readonly Party strangers = TestData.StrangersParty();
    private CancellationToken Cancel => TestContext.Current.CancellationToken;

    public async ValueTask InitializeAsync() => await factory.SeedAsync(db =>
    {
        TestData.AddPeople(db);
        db.Parties.AddRange(dinoParty, lastYear, strangers);
        db.Guests.Add(new Guest(Guid.NewGuid(), dinoParty.Id, "Maya Chen", "Lily Chen", "lily.chen@example.com", null));
        db.Guests.AddRange(
            new Guest(Guid.NewGuid(), lastYear.Id, "Leo Rossi", "Marco Rossi", "marco.rossi@example.com", "647-555-0101"),
            new Guest(Guid.NewGuid(), lastYear.Id, "Maya Chen", "Lily Chen", "lily.chen@example.com", "416-555-0177"));
        db.Guests.Add(new Guest(Guid.NewGuid(), strangers.Id, "Mila Novak", "Ivana Novak", "ivana.novak@example.com", null));
    });

    [Fact]
    public async Task Checking_a_file_names_rows_missing_an_email_and_guests_already_on_the_list()
    {
        using var amara = await factory.CreateBrowserClientFor(TestParent.Amara);

        var response = await amara.PostAsync($"{ImportsUrl}/check", Upload(ClassList, "class list.csv"), Cancel);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var preview = await response.Content.ReadFromJsonAsync<JsonElement>(Cancel);
        Assert.Equal((5, 3), (preview.GetProperty("rows").GetInt32(), preview.GetProperty("ready").GetInt32()));
        var missing = Assert.Single(preview.GetProperty("missingEmail").EnumerateArray());
        Assert.Equal((5, "Aisha Mohamed"), (missing.GetProperty("row").GetInt32(), missing.GetProperty("child").GetString()));
        var duplicate = Assert.Single(preview.GetProperty("duplicates").EnumerateArray());
        Assert.Equal((2, "Maya Chen"), (duplicate.GetProperty("row").GetInt32(), duplicate.GetProperty("child").GetString()));
        Assert.Single(await GuestsAsync(amara));
    }

    [Fact]
    public async Task Importing_adds_each_valid_row_and_reports_what_was_skipped_and_why()
    {
        using var amara = await factory.CreateBrowserClientFor(TestParent.Amara);

        var response = await amara.PostAsync(ImportsUrl, Upload(ClassList, "class list.csv"), Cancel);

        var report = await response.Content.ReadFromJsonAsync<JsonElement>(Cancel);
        Assert.Equal(3, report.GetProperty("imported").GetInt32());
        Assert.Equal(
            [("Maya Chen", "Already on the list"), ("Aisha Mohamed", "No parent email")],
            report.GetProperty("skipped").EnumerateArray().Select(s => (s.GetProperty("child").GetString(), s.GetProperty("reason").GetString())));
        var guests = await GuestsAsync(amara);
        Assert.Equal(["Hana Sato", "Maya Chen", "Noah Tremblay", "O'Brien, Liam"], guests.Select(g => g.GetProperty("childName").GetString()));
        Assert.All(guests, g => Assert.Equal("notSent", g.GetProperty("rsvp").GetString()));
    }

    [Fact]
    public async Task An_xlsx_class_list_is_read_by_cell_value()
    {
        using var amara = await factory.CreateBrowserClientFor(TestParent.Amara);

        var response = await amara.PostAsync(ImportsUrl, Upload(Xlsx(["Child", "Parent", "Email", "Mobile"], ["Leo Rossi", "Marco Rossi", "marco.rossi@example.com", "647-555-0101"]), "class.xlsx"), Cancel);

        Assert.Equal(1, (await response.Content.ReadFromJsonAsync<JsonElement>(Cancel)).GetProperty("imported").GetInt32());
        Assert.Contains(await GuestsAsync(amara), g => g.GetProperty("childName").GetString() == "Leo Rossi");
    }

    [Theory]
    [InlineData("class list.txt", 10)]
    [InlineData("class list.csv", 2 * 1024 * 1024 + 1)]
    public async Task Only_csv_or_xlsx_files_up_to_two_megabytes_are_accepted(string name, int size)
    {
        using var amara = await factory.CreateBrowserClientFor(TestParent.Amara);

        var response = await amara.PostAsync(ImportsUrl, Upload(new string('a', size), name), Cancel);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        var problem = await response.Content.ReadFromJsonAsync<JsonElement>(Cancel);
        Assert.Equal("Choose a .csv or .xlsx file up to 2 MB.", problem.GetProperty("title").GetString());
        Assert.Single(await GuestsAsync(amara));
    }

    [Fact]
    public async Task A_file_that_is_not_a_readable_spreadsheet_is_rejected()
    {
        using var amara = await factory.CreateBrowserClientFor(TestParent.Amara);

        var response = await amara.PostAsync(ImportsUrl, Upload("not really a spreadsheet", "class.xlsx"), Cancel);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task A_file_that_fails_the_malware_scan_is_not_imported()
    {
        using var amara = await factory.CreateBrowserClientFor(TestParent.Amara);

        var response = await amara.PostAsync(ImportsUrl, Upload(ClassList + "\nX5O,EICAR-STANDARD-ANTIVIRUS-TEST-FILE,x@example.com,", "class.csv"), Cancel);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        Assert.Contains("unsafe", (await response.Content.ReadFromJsonAsync<JsonElement>(Cancel)).GetProperty("title").GetString());
        Assert.Single(await GuestsAsync(amara));
    }

    [Fact]
    public async Task Last_years_guests_can_be_reused_without_their_replies()
    {
        using var amara = await factory.CreateBrowserClientFor(TestParent.Amara);

        var sources = await amara.GetFromJsonAsync<JsonElement>($"{ImportsUrl}/sources", Cancel);
        var response = await amara.PostAsJsonAsync($"{ImportsUrl}/from-party", new { sourcePartyId = lastYear.Id }, Cancel);

        var source = Assert.Single(sources.EnumerateArray());
        Assert.Equal(("Zuri’s 6th: Mermaid Splash", 2), (source.GetProperty("name").GetString(), source.GetProperty("guests").GetInt32()));
        var report = await response.Content.ReadFromJsonAsync<JsonElement>(Cancel);
        Assert.Equal(1, report.GetProperty("imported").GetInt32());
        Assert.Equal("Already on the list", Assert.Single(report.GetProperty("skipped").EnumerateArray()).GetProperty("reason").GetString());
    }

    [Fact]
    public async Task Another_familys_party_cannot_be_used_as_a_source()
    {
        using var amara = await factory.CreateBrowserClientFor(TestParent.Amara);

        var response = await amara.PostAsJsonAsync($"{ImportsUrl}/from-party", new { sourcePartyId = strangers.Id }, Cancel);

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task Rows_beyond_sixty_guests_are_skipped()
    {
        await factory.SeedAsync(db => db.Guests.AddRange(Enumerable.Range(1, 58).Select(i =>
            new Guest(Guid.NewGuid(), dinoParty.Id, $"Child {i}", $"Parent {i}", $"parent{i}@example.com", null))));
        using var amara = await factory.CreateBrowserClientFor(TestParent.Amara);

        var report = await (await amara.PostAsync(ImportsUrl, Upload(ClassList, "class.csv"), Cancel)).Content.ReadFromJsonAsync<JsonElement>(Cancel);

        Assert.Equal(1, report.GetProperty("imported").GetInt32());
        Assert.Equal(2, report.GetProperty("skipped").EnumerateArray().Count(s => s.GetProperty("reason").GetString() == "The list holds up to 60 guests"));
    }

    [Fact]
    public async Task Viewers_cannot_import()
    {
        using var dev = await factory.CreateBrowserClientFor(TestParent.Dev);

        var response = await dev.PostAsync(ImportsUrl, Upload(ClassList, "class.csv"), Cancel);

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }

    public ValueTask DisposeAsync()
    {
        factory.Dispose();
        return ValueTask.CompletedTask;
    }

    private string ImportsUrl => $"/api/parties/{dinoParty.Id}/imports";

    private async Task<List<JsonElement>> GuestsAsync(HttpClient client) =>
        (await client.GetFromJsonAsync<JsonElement>($"/api/parties/{dinoParty.Id}/guests", Cancel)).GetProperty("guests").EnumerateArray().ToList();

    private static MultipartFormDataContent Upload(string text, string name) => Upload(Encoding.UTF8.GetBytes(text), name);

    private static MultipartFormDataContent Upload(byte[] bytes, string name)
    {
        var file = new ByteArrayContent(bytes);
        file.Headers.ContentType = new MediaTypeHeaderValue("application/octet-stream");
        return new MultipartFormDataContent { { file, "file", name } };
    }

    private static byte[] Xlsx(params string[][] rows)
    {
        using var stream = new MemoryStream();
        using (var document = SpreadsheetDocument.Create(stream, SpreadsheetDocumentType.Workbook))
        {
            var workbook = document.AddWorkbookPart();
            workbook.Workbook = new Workbook();
            var sheetPart = workbook.AddNewPart<WorksheetPart>();
            var data = new SheetData();
            foreach (var row in rows)
            {
                data.AppendChild(new Row(row.Select(value => new Cell { DataType = CellValues.InlineString, InlineString = new InlineString(new Text(value)) })));
            }

            sheetPart.Worksheet = new Worksheet(data);
            var sheets = workbook.Workbook.AppendChild(new Sheets());
            sheets.AppendChild(new Sheet { Id = workbook.GetIdOfPart(sheetPart), SheetId = 1, Name = "Class" });
        }

        return stream.ToArray();
    }
}
