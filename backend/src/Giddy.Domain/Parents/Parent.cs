namespace Giddy.Domain.Parents;

/// <summary>A signed-in parent as other planners see them. Kept current from the sign-in claims.</summary>
public sealed class Parent
{
    private Parent()
    {
        Name = string.Empty;
        Email = string.Empty;
    }

    public Parent(Guid id, string name, string email)
    {
        Id = id;
        Name = name;
        Email = email;
    }

    public Guid Id { get; private set; }

    public string Name { get; private set; }

    public string Email { get; private set; }

    public void Update(string name, string email)
    {
        Name = name;
        Email = email;
    }
}
