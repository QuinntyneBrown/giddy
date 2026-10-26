namespace Giddy.Domain.Parents;

public enum AccountTokenPurpose
{
    VerifyEmail,
    ResetPassword,

    /// <summary>Confirms a new address before it replaces the old one.</summary>
    ChangeEmail,
}
