namespace Giddy.Domain.Families;

/// <summary>
/// A household: its postal code and its children, identified by the parent who owns it.
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

    public bool UpdateChild(Child child)
    {
        var index = Children.FindIndex(c => c.Id == child.Id);
        if (index < 0)
        {
            return false;
        }

        Children[index] = child;
        return true;
    }

    public bool RemoveChild(Guid childId) => Children.RemoveAll(c => c.Id == childId) > 0;

    public void MoveTo(string postalCode) => PostalCode = postalCode;
}
