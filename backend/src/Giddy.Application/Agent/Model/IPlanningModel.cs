namespace Giddy.Application.Agent.Model;

/// <summary>The language model behind Giddy. Throws <see cref="ModelUnavailableException"/> when it cannot answer.</summary>
public interface IPlanningModel
{
    Task<ModelResponse> NextAsync(ModelRequest request, CancellationToken cancellationToken);
}
