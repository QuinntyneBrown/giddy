using Giddy.Application.Common;
using Microsoft.AspNetCore.DataProtection;

namespace Giddy.Api.Security;

public sealed class DataProtectionSecretProtector(IDataProtectionProvider provider) : ISecretProtector
{
    private readonly IDataProtector protector = provider.CreateProtector("Giddy.RsvpTokens");

    public string Protect(string secret) => protector.Protect(secret);

    public string Unprotect(string protectedSecret) => protector.Unprotect(protectedSecret);
}
