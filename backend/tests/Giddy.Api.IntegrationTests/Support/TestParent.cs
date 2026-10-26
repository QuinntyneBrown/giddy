namespace Giddy.Api.IntegrationTests.Support;

public sealed record TestParent(Guid Id, string Name, string Email)
{
    public static readonly TestParent Amara = new(
        Guid.Parse("6f1c2a52-8a51-4a5e-9d0e-2f8f0a1b3c01"), "Amara Okafor", "amara.okafor@example.com");

    public static readonly TestParent Kemi = new(
        Guid.Parse("0b7f6d1e-3c2a-4b8e-a1f0-5d6c7e8f9a02"), "Kemi Okafor", "kemi.okafor@example.com");

    public static readonly TestParent Dev = new(
        Guid.Parse("c4d2e8f1-7a6b-4c3d-9e0f-1a2b3c4d5e03"), "Dev Patel", "dev.patel@example.com");

    public static readonly TestParent Stranger = new(
        Guid.Parse("9e8d7c6b-5a4f-4e3d-8c2b-1a0f9e8d7c04"), "Lena Fischer", "lena.fischer@example.com");

    public string HeaderValue => $"{Id}|{Name}|{Email}";
}
