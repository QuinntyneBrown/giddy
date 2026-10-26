namespace Giddy.Application.Venues.Compare;

/// <param name="Best">The best value in its row; the page says so in words as well as colour.</param>
public sealed record CompareCell(string Text, bool Best);
