namespace Giddy.Application.Wrapping;

/// <param name="Created">False when the party's plan was already saved.</param>
public sealed record SavedTemplate(TemplateView Template, bool Created);
