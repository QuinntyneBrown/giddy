namespace Giddy.Domain.Families;

/// <summary>
/// A household: its postal code and its children. Until accounts arrive (journey 13) a family is
/// identified by the parent who owns it.
/// </summary>
public sealed class Family
{
    private Family()
    {
        PostalCode = string.Empty;
    }

    public Family(Guid id, string postalCode)
    {
        Id = id;
        PostalCode = postalCode;
    }

    public Guid Id { get; private set; }

    public string PostalCode { get; private set; }

    public List<Child> Children { get; private set; } = [];

    public void AddChild(Child child) => Children.Add(child);
}
