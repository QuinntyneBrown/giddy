using MediatR;

namespace Giddy.Application.Accounts.SignUp;

public sealed record SignUpCommand(string FirstName, string Email, string Password, string PostalCode, bool Marketing) : IRequest<SignedUp>;
