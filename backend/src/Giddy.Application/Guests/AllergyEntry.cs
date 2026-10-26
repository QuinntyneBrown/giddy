namespace Giddy.Application.Guests;

/// <summary>What the venue needs: a child's first name and allergy, never the parent's details.</summary>
public sealed record AllergyEntry(string Child, string Allergy);
